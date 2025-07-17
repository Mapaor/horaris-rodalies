from seleniumwire import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from urllib.parse import urlparse, parse_qs, quote
from datetime import datetime
import json
import time

def extreure_valors_d_una_url(url):
    parsed = urlparse(url)
    query_params = parse_qs(parsed.query)
    return {
        'idProducto': query_params.get('query[idProducto]', [None])[0],
        'paqueteId': query_params.get('query[paqueteId]', [None])[0],
        'idPaquete': query_params.get('query[idPaquete]', [None])[0],
        'cookie': query_params.get('query[cookie]', [None])[0]
    }

def obtenir_valors_d_una_data(data_viaje='18-07-2025'):
    chrome_options = Options()
    # chrome_options.add_argument('--headless')  # COMENTA per veure'l
    chrome_options.add_argument('--disable-gpu')

    driver = webdriver.Chrome(options=chrome_options)

    try:
        aveServeiId = 23190
        data_viaje_iso = datetime.strptime(data_viaje, "%d-%m-%Y").strftime("%Y-%m-%d")
        data_json = f'[{{"date":"{data_viaje_iso}"}},{{"selects":[{{"{aveServeiId}":"1"}}]}}]'
        data_param = quote(data_json)

        url = (
            f"https://renfeviajes.renfe.com/es/CompraDestino/9799"
            f"?dateFrom={data_viaje}&dateTo={data_viaje}"
            f"&departureStation=112&destinationStation=105"
            f"&numTicketsAdults=1&numTicketsChildren=0&numTicketsBabies=0"
            f"&soloIda=true&data={data_param}"
            f"&showPriceTrain=false&allTrains=true"
        )
        print(f"🔗 URL: {url}")

        driver.get(url)

        # Esperem uns segons per a que es carregui tot
        time.sleep(10)

        print("📡 Peticions capturades:")
        for request in driver.requests:
            print(request.url)
            if (
                request.response and
                'queryNewAPIProceso' in request.url and
                'query[cookie]=' in request.url and
                'resttrain.renfeviajes.renfe.com' in request.url
            ):
                valors = extreure_valors_d_una_url(request.url)
                print("🔍 Dades trobades:")
                print(json.dumps(valors, indent=4))
                break
        else:
            print("❌ No s'ha trobat cap petició a queryNewAPIProceso.")

    finally:
        driver.quit()

# Prova-ho
obtenir_valors_d_una_data('18-07-2025')
