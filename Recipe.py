from typing import List, Tuple
from dataclasses import dataclass, field, asdict
from bs4 import Tag

@dataclass
class Ingredient:
    name: str
    unit: str
    amount: str

    def to_dict(self) -> dict:
        return asdict(self)

@dataclass
class Instruction:
    order: int
    instruction: str

    def to_dict(self) -> dict:
        return asdict(self)

@dataclass
class Recipe:
    url: str
    name: str = ''
    description: str = ''
    ingredients: List[Ingredient] = field(default_factory=list)
    instructions: List[Instruction] = field(default_factory=list)
    instruction_counter: int = 0

    def add_ingredient(self, ingredient: Tag) -> Tuple[bool, str]:
        error, name, unit, amount = self.parse_ingredient(ingredient)
        if len(error) > 0:
            return False, error
        self.ingredients.append(Ingredient(name, unit, amount))
        return True, error

    def add_instruction(self, instruction: Tag) -> Tuple[bool, str]:
        error, instruction = self.parse_instruction(instruction)
        if len(error) > 0:
            return False, error
        self.instruction_counter += 1
        self.instructions.append(Instruction(self.instruction_counter, instruction))
        return True, error

    def parse_instruction(self, instruction: Tag) -> Tuple[str]:
        instruction_text = ''
        error = ''
        success, instruction_span = self._parse_tag_(instruction, 'span')
        if not success:
            if len(instruction.text) == 0:
                error = f'Unable to parse HTML. Cannot find span/div for instruction: {instruction}'
                return error, instruction_text
            else:
                instruction_text = instruction.text
        else:
            instruction_text = instruction_span[0].text
        return error, instruction_text

    def parse_ingredient(self, ingredient: Tag) -> Tuple[str]:
        amount = ''
        unit = ''
        name = ''
        error = ''
        success, amount_span = self._parse_tag_(ingredient, 'span', class_name='wprm-recipe-ingredient-amount')
        if not success:
            amount = ''
        else:
            amount = amount_span[0].text
        success, unit_span = self._parse_tag_(ingredient, 'span', class_name='wprm-recipe-ingredient-unit')
        if not success:
            unit = ''
        else:
            unit = unit_span[0].text
        success, name_span = self._parse_tag_(ingredient, 'span', class_name='wprm-recipe-ingredient-name')
        if not success:
            error = f'Unable to parse HTML.  Cannot find name span for ingredient: {ingredient}'
            return error, amount, unit, name
        name = name_span[0].text
        return error, name, unit, amount

    def _parse_tag_(self, parent: Tag, tag_name: str, class_name: str = None, id_name: str = None) -> Tuple[bool, List[Tag]|None]:
        if id_name is not None:
            tag_data = parent.find_all(tag_name, id=id_name)
        elif class_name is not None:
            tag_data = parent.find_all(tag_name, class_=class_name)
        else:
            tag_data = parent.find_all(tag_name)
        if len(tag_data) == 0:
            return False, None
        return True, tag_data

    def to_dict(self) -> dict:
        return asdict(self)