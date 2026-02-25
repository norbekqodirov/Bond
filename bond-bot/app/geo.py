from __future__ import annotations

import json
from pathlib import Path
from typing import Dict, List

STORAGE_DIR = Path("storage")
GEO_PATH = STORAGE_DIR / "geodata.json"


DEFAULT_REGIONS: List[str] = [
    "Toshkent shahri",
    "Toshkent viloyati",
    "Andijon",
    "Farg'ona",
    "Namangan",
    "Sirdaryo",
    "Jizzax",
    "Samarqand",
    "Navoiy",
    "Buxoro",
    "Qashqadaryo",
    "Surxondaryo",
    "Xorazm",
    "Qoraqalpog'iston",
]


DEFAULT_DISTRICTS: Dict[str, List[str]] = {
    "Toshkent shahri": [
        "Chilonzor", "Yunusobod", "Mirzo Ulug'bek", "Yakkasaroy", "Mirobod", "Shayxontohur",
        "Olmazor", "Uchtepa", "Yashnobod", "Sirg'ali", "Bektemir"],
    "Toshkent viloyati": ["Chirchiq", "Bekobod", "Angren", "Olmaliq", "Nurafshon"],
    "Andijon": ["Andijon shahri", "Asaka", "Xonobod"],
    "Farg'ona": ["Farg'ona shahri", "Marg'ilon", "Qo'qon"],
    "Namangan": ["Namangan shahri", "Chortoq", "Chust"],
    "Sirdaryo": ["Guliston", "Shirin", "Yangier"],
    "Jizzax": ["Jizzax shahri", "Zomin", "Forish"],
    "Samarqand": ["Samarqand shahri", "Kattaqo'rg'on", "Urgut"],
    "Navoiy": ["Navoiy shahri", "Zarafshon", "Qiziltepa"],
    "Buxoro": ["Buxoro shahri", "G'ijduvon", "Kogon"],
    "Qashqadaryo": ["Qarshi", "Shahrisabz", "Kitob"],
    "Surxondaryo": ["Termiz", "Sherobod", "Denov"],
    "Xorazm": [
        "Urganch shahri",
        "Xiva shahri",
        "Pitnak shahri",
        "Bogʻot tumani",
        "Gurlan tumani",
        "Qoʻshkoʻpir tumani",
        "Urganch tumani",
        "Xiva tumani",
        "Yangiariq tumani",
        "Yangibozor tumani",
        "Xonqa tumani",
        "Shovot tumani",
        "Tuproqqalʼa tumani",
    ],
    "Qoraqalpog'iston": ["Nukus", "Taxiatosh", "Xo'jayli"],
}


def load_geodata() -> tuple[List[str], Dict[str, List[str]]]:
    try:
        if GEO_PATH.exists():
            data = json.loads(GEO_PATH.read_text(encoding="utf-8"))
            regions = data.get("regions") or DEFAULT_REGIONS
            districts = data.get("districts") or DEFAULT_DISTRICTS
            return regions, districts
    except Exception:
        pass
    return DEFAULT_REGIONS, DEFAULT_DISTRICTS


def save_geodata(regions: List[str], districts: Dict[str, List[str]]) -> None:
    STORAGE_DIR.mkdir(parents=True, exist_ok=True)
    GEO_PATH.write_text(json.dumps({"regions": regions, "districts": districts}, ensure_ascii=False, indent=2), encoding="utf-8")


def get_regions() -> List[str]:
    regions, _ = load_geodata()
    return regions


def get_districts(region: str) -> List[str]:
    _, d = load_geodata()
    return d.get(region, [])


def parse_geo_excel(path: Path) -> tuple[List[str], Dict[str, List[str]]]:
    import openpyxl
    wb = openpyxl.load_workbook(path)
    # Expect a sheet with two columns: Region, District
    ws = wb.active
    regions_set = set()
    mapping: Dict[str, List[str]] = {}
    for row in ws.iter_rows(min_row=2, values_only=True):
        if not row:
            continue
        region = (row[0] or "").strip()
        district = (row[1] or "").strip()
        if not region:
            continue
        regions_set.add(region)
        if district:
            mapping.setdefault(region, []).append(district)
    regions = sorted(regions_set)
    return regions, mapping
