from aiogram.fsm.state import StatesGroup, State


class ProfileStates(StatesGroup):
    waiting_language = State()
    waiting_role = State()
    waiting_name = State()
    waiting_phone = State()


class RegistrationStates(StatesGroup):
    entering_fullname = State()
    choosing_region = State()
    choosing_district = State()
    entering_region_text = State()
    entering_district_text = State()
    choosing_olympiad = State()
    choosing_direction = State()
    choosing_group = State()
    choosing_grade = State()
    entering_birth = State()
    entering_school = State()
    entering_phone_reg = State()
    entering_grade = State()
    choosing_lang = State()
    confirming = State()


class AdminLoginStates(StatesGroup):
    waiting_username = State()
    waiting_password = State()


class AdminStates(StatesGroup):
    main = State()
    new_olymp_name = State()
    new_olymp_desc = State()
    new_olymp_poster = State()
    new_olymp_pdf = State()
    new_olymp_datetime = State()
    new_olymp_address = State()
    new_olymp_phone = State()
    new_olymp_langs = State()
    add_dir_name = State()
    add_dir_grouping = State()
    add_dir_groups = State()
    add_groups_to_direction = State()
    rename_dir_waiting_name = State()
    rename_group_waiting_name = State()
    geo_import_waiting = State()
