from dataclasses import dataclass
from enum import IntEnum
from itertools import product
from random import shuffle


class SlotType(IntEnum):
    p1_stacks = 0
    p2_stacks = 1
    piles = 2
    p1_decks = 3
    p2_decks = 4


@dataclass
class Card:
    color: int
    number: int


class StressGame:
    def __init__(self):
        self.state = {
            SlotType.p1_stacks: [[], [], [], []],
            SlotType.p2_stacks: [[], [], [], []],
            SlotType.piles: [[], []],
            SlotType.p1_decks: [[]],
            SlotType.p2_decks: [[]],
        }
        self.ready = [False, False]

        # Put random cards in decks
        cards = []
        for color, number in product(range(0, 4), range(1, 10)):
            cards.append(Card(color, number))
            cards.append(Card(color, number))
        shuffle(cards)
        self.state[SlotType.p1_decks][0] = cards[:36]
        self.state[SlotType.p2_decks][0] = cards[36:]

    def move(
        self, from_type: int, from_id: int, to_type: int, to_id: int, to_number: int, player: int
    ) -> tuple[int, int, int, int, int] | None:
        if to_type == SlotType.piles:  # only check for race conditions if moving to a pile
            if to_number != -1 and to_number != (self.state[to_type][to_id][-1].number if self.state[to_type][to_id] else 0):
                # -1 means disregard, 0 means no card
                # Race condition
                print(f"player expected {to_number} which is wrong")
                return None
        moved_card = self.state[from_type][from_id][-1]
        self.state[to_type][to_id].append(self.state[from_type][from_id].pop())
        try:
            replacement_card = self.state[from_type][from_id][-1]
        except IndexError:
            replacement_card = Card(0, 0)
        return (
            moved_card.color,
            moved_card.number,
            replacement_card.color,
            replacement_card.number,
            len(self.state[player + 2][0]),
        )

    def stuck(self) -> tuple[bool, int]:
        """Returns whether it is impossible to pile on more cards."""
        if not all(self.state[SlotType.piles]):
            print("pile(s) is/are empty")
            return (False, 0)
        p1_full = all(self.state[SlotType.p1_stacks]) or not self.state[SlotType.p1_decks][0]
        p2_full = all(self.state[SlotType.p2_stacks]) or not self.state[SlotType.p2_decks][0]
        if not (p1_full and p2_full):
            print(
                "not full",
                all(self.state[SlotType.p1_stacks]),
                not self.state[SlotType.p1_decks][0],
                all(self.state[SlotType.p2_stacks]),
                not self.state[SlotType.p2_decks][0],
            )
            return (False, 0)
        pile_accepted = set()
        for p in self.state[SlotType.piles]:
            if p:
                pile_accepted.add(uno_mod(p[-1].number + 1))
                pile_accepted.add(uno_mod(p[-1].number - 1))
        for c in self.state[SlotType.p1_stacks] + self.state[SlotType.p2_stacks]:
            if c:
                if c[-1].number in pile_accepted:
                    print("stuck False")
                    return (False, 0)
        dative = 0
        if not self.state[SlotType.p1_decks][0]:
            dative = 2
        elif not self.state[SlotType.p2_decks][0]:
            dative = 1
        elif not self.state[SlotType.p1_decks][0] and not self.state[SlotType.p2_decks][0]:
            print("this is a real sticky situation. what do we do? maybe flip a coin and each player gets one pile.")
            dative = 0
        print("stuck True", dative)
        return (True, dative)


def flip_player(card_type: int) -> int:
    match card_type:
        case 0:
            return 1
        case 1:
            return 0
        case 2:
            return 2
        case 3:
            return 4
        case 4:
            return 3


def uno_mod(number: int) -> int:
    return ((number - 1) % 9) + 1
