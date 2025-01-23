"""WebSocket server."""

from asyncio import get_running_loop, run, sleep
from random import randint

from ordered_set import OrderedSet
from websockets.asyncio.server import ServerConnection, broadcast, serve
from websockets.exceptions import ConnectionClosedOK

from game import SlotType, StressGame, flip_player

stress_games = {}


async def start(websocket: ServerConnection) -> None:
    """Start a new game."""
    game = StressGame()
    connected = OrderedSet([websocket])
    join_key = randint(1, 10)
    stress_games[join_key] = game, connected
    try:
        await websocket.send(str(join_key))
        print("player 1 started game", join_key)
        await play(websocket, game, 1, connected)
    finally:
        connected.remove(websocket)
        del stress_games[join_key]
        print("player 1 left game")


async def join(websocket: ServerConnection, join_key: int) -> None:
    """Join an existing game."""
    try:
        game, connected = stress_games[join_key]
    except KeyError:
        print("not found")
        await websocket.send("negative")
        return
    if len(connected) >= 2:
        print("both players have already joined")
        return
    connected.add(websocket)
    try:
        print("player 2 joined game", join_key)
        await websocket.send("affirm")
        # Send the card at the top of their pile to each player
        await sleep(2)
        p1_deck_top = game.state[SlotType.p1_decks][0][-1]
        p2_deck_top = game.state[SlotType.p2_decks][0][-1]
        await connected[0].send(f"setup {p1_deck_top.color} {p1_deck_top.number} {p2_deck_top.color} {p2_deck_top.number}")
        await websocket.send(f"setup {p2_deck_top.color} {p2_deck_top.number} {p1_deck_top.color} {p1_deck_top.number}")
        await play(websocket, game, 2, connected)
    finally:
        connected.remove(websocket)
        print("player 2 left game")


async def play(websocket: ServerConnection, game: StressGame, player: int, connected: OrderedSet[ServerConnection]) -> None:
    """Main game loop."""
    async for message in websocket:
        print(f"{player}<<{message}")
        args = message.split(" ")
        command = args[0]
        match command:
            case "ready":
                game.ready[player - 1] = True
                if all(game.ready):
                    await deck_to_pile(game, connected, "begin", 0)
                    print(game.state[SlotType.piles])
            case "move":
                from_type, from_id, to_type, to_id, to_number = map(int, args[1:])
                if player == 2:
                    from_type = flip_player(from_type)
                    to_type = flip_player(to_type)
                print(from_type, from_id, to_type, to_id, to_number)
                try:
                    move_result = game.move(from_type, from_id, to_type, to_id, to_number, player)
                    if move_result is None:
                        await websocket.send("negative")
                        continue
                    moved_color, moved_number, replacement_color, replacement_number, opponent_deck_count = move_result
                except ValueError:
                    await websocket.send("negative")
                    continue
                await websocket.send(f"affirm {replacement_color} {replacement_number} {opponent_deck_count}")
                await connected[2 - player].send(
                    f"move {from_type} {from_id} {to_type} {to_id} {moved_color} {moved_number} {replacement_color} {replacement_number} {opponent_deck_count}"
                )
                stucked = game.stuck()
                while stucked[0]:
                    await sleep(1)
                    await deck_to_pile(game, connected, "stuck", stucked[1])
                    stucked = game.stuck()
                # Check if game won
                winner = game.check_winner()
                if winner > 0:
                    print(f"PLAYER {winner} has WON!")
                    await sleep(0.3)
                    await connected[winner - 1].send("game true")
                    await connected[2 - winner].send("game false")
                    return
            case "stress":
                result = game.stress(player)
                if result == 0:
                    print(game.state, 5 - player)
                    loser_deck_count = len(game.state[5 - player][0])
                    await websocket.send(f"stressed true {loser_deck_count}")
                    await connected[2 - player].send(f"stressed false {loser_deck_count}")
                else:
                    await websocket.send(f"invalidStress {result}")
                    continue
                await sleep(1)
                await deck_to_pile(game, connected, "begin", 0)
                game.stress_allowed = True


async def deck_to_pile(game: StressGame, connected: OrderedSet[ServerConnection], command: str, dative: int) -> None:
    # dative: 0: both put, 1: player 1 puts both, 2: player 2 puts both
    repeats = dative_repeat(dative)
    steps: list[tuple[int, int]] = []
    for i in range(repeats[0]):
        _, _, new_color, new_number, _ = game.move(SlotType.p1_decks, 0, SlotType.piles, i, -1, 1)
        steps.append((new_color, new_number))
    for i in range(repeats[1]):
        _, _, new_color, new_number, _ = game.move(SlotType.p2_decks, 0, SlotType.piles, i + repeats[0], -1, 2)
        steps.append((new_color, new_number))
    message = f"{command} {dative} {steps[0][0]} {steps[0][1]} {steps[1][0]} {steps[1][1]}"
    print(message)
    broadcast(connected, message)


def dative_repeat(dative: int) -> tuple[int, int]:
    """Dative."""
    match dative:
        case 0:
            return (1, 1)
        case 1:
            return (2, 0)
        case 2:
            return (0, 2)


async def handler(websocket: ServerConnection) -> None:
    """Handle a new connecion."""
    print("connected")
    try:
        message = await websocket.recv()
    except ConnectionClosedOK:
        print("disconnected")
        return
    args = message.split(" ")
    command = args[0]
    match command:
        case "start":
            await start(websocket)
        case "join":
            await join(websocket, int(args[1]))


async def main():
    """Main loop."""
    async with serve(handler, "0.0.0.0", 8765):
        await get_running_loop().create_future()  # run forever


if __name__ == "__main__":
    print("started")
    run(main())
