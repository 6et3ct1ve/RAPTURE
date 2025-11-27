from django.core.management.base import BaseCommand
import requests
import time
from games.models import Game

POPULAR_APP_IDS = [
    730,  # Counter-Strike 2
    570,  # Dota 2
    1172470,  # Apex Legends
    578080,  # PUBG: BATTLEGROUNDS
    1086940,  # Baldur's Gate 3
    271590,  # Grand Theft Auto V
    1938090,  # Call of Duty
    2358720,  # Black Myth: Wukong
    1203220,  # NARAKA: BLADEPOINT
    1517290,  # Battlefield 2042
    1091500,  # Cyberpunk 2077
    812140,  # Assassin's Creed Valhalla
    1174180,  # Red Dead Redemption 2
    892970,  # Valheim
    1245620,  # ELDEN RING
    1782210,  # Resident Evil 4
    2294630,  # Starfield
    1887720,  # Hogwarts Legacy
    2321470,  # EA SPORTS FC 24
    1716740,  # Mortal Kombat 1
]


class Command(BaseCommand):
    help = "Import games from Steam"

    def add_arguments(self, parser):
        parser.add_argument(
            "--appid", type=int, help="Import specific game by Steam App ID"
        )

    def handle(self, *args, **options):
        if options["appid"]:
            self.import_game(options["appid"])
        else:
            self.stdout.write(f"Importing {len(POPULAR_APP_IDS)} popular games...\n")

            imported = 0
            for app_id in POPULAR_APP_IDS:
                if self.import_game(app_id):
                    imported += 1
                time.sleep(1.5)

            self.stdout.write(
                self.style.SUCCESS(
                    f"\nTotal imported: {imported}/{len(POPULAR_APP_IDS)}"
                )
            )

    def import_game(self, app_id):
        try:
            url = f"https://store.steampowered.com/api/appdetails?appids={app_id}"
            response = requests.get(url, timeout=10)

            if response.status_code != 200:
                self.stdout.write(
                    self.style.WARNING(f"HTTP {response.status_code} for {app_id}")
                )
                return False

            try:
                data = response.json()
            except ValueError:
                self.stdout.write(self.style.WARNING(f"✗ Invalid JSON for {app_id}"))
                return False

            if not data.get(str(app_id), {}).get("success"):
                return False

            game_data = data[str(app_id)]["data"]

            if game_data.get("type") != "game":
                return False

            game, created = Game.objects.get_or_create(
                steam_app_id=app_id,
                defaults={
                    "title": game_data.get("name", "")[:255],
                    "description": game_data.get("short_description", "")[:500],
                    "developer": ", ".join(game_data.get("developers", []))[:255],
                    "publisher": ", ".join(game_data.get("publishers", []))[:255],
                },
            )

            if created:
                self.stdout.write(self.style.SUCCESS(f'{game_data.get("name")}'))
            else:
                self.stdout.write(
                    self.style.WARNING(f'Already exists: {game_data.get("name")}')
                )

            return created

        except Exception as e:
            self.stdout.write(self.style.ERROR(f"{app_id}: {str(e)}"))
            return False
