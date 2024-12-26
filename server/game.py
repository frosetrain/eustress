from dataclasses import dataclass
from enum import Enum, IntEnum
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
    ) -> tuple[int, int, int, int, int]:
        if to_type == SlotType.piles:  # only check for race conditions if moving to a pile
            if to_number != (self.state[to_type][to_id][-1].number if self.state[to_type][to_id] else 0):
                # Race condition
                print(f"player expected {to_number} which is wrong")
                raise ValueError
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
