"""WebSocket server."""

from asyncio import get_running_loop, run, sleep
from random import randint

from ordered_set import OrderedSet
from websockets.asyncio.server import serve
from websockets.exceptions import ConnectionClosedOK

from game import SlotType, StressGame, flip_player

stress_games = {}


async def start(websocket):
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
        del stress_games[join_key]
        print("player 1 disconnected")


async def join(websocket, join_key: int):
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
        await sleep(1)
        deck_top = game.state[SlotType.p1_decks][0][-1]
        await connected[0].send(f"begin {deck_top.color} {deck_top.number}")
        deck_top = game.state[SlotType.p2_decks][0][-1]
        await websocket.send(f"begin {deck_top.color} {deck_top.number}")
        await play(websocket, game, 2, connected)
    finally:
        connected.remove(websocket)
        print("player 2 disconnected")


async def play(websocket, game, player, connected):
    """Main game loop."""
    async for message in websocket:
        print(f"{player}<<{message}")
        args = message.split(" ")
        command = args[0]
        match command:
            case "move":
                from_type, from_id, to_type, to_id, to_number = map(int, args[1:])
                if player == 2:
                    from_type = flip_player(from_type)
                    to_type = flip_player(to_type)
                print(from_type, from_id, to_type, to_id, to_number)
                try:
                    moved_color, moved_number, replacement_color, replacement_number, opponent_deck_count = game.move(
                        from_type, from_id, to_type, to_id, to_number, player
                    )
                except ValueError:
                    await websocket.send("negative")
                    continue
                await websocket.send(f"affirm {replacement_color} {replacement_number} {opponent_deck_count}")
                await connected[2 - player].send(
                    f"move {from_type} {from_id} {to_type} {to_id} {moved_color} {moved_number} {replacement_color} {replacement_number} {opponent_deck_count}"
                )


async def handler(websocket):
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
    async with serve(handler, "localhost", 8765):
        await get_running_loop().create_future()  # run forever


if __name__ == "__main__":
    print("started")
    run(main())
