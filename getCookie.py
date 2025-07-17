# py -3.11 -m pip install selenium-wire
# py -3.11 -m pip install "blinker<1.7"
# py -3.11 getCookie.py

from seleniumwire import webdriver
from selenium.webdriver.chrome.options import Options
from urllib.parse import urlparse, parse_qs, unquote
import json
import time

def extreure_valors_d_una_url(url):
    parsed = urlparse(url)
    query_params = parse_qs(parsed.query)
    resultat = {
        'idProducto': query_params.get('query[idProducto]', [None])[0],
        'paqueteId': query_params.get('query[paqueteId]', [None])[0],
        'idPaquete': query_params.get('query[idPaquete]', [None])[0],
        'cookie': query_params.get('query[cookie]', [None])[0]
    }
    return resultat

def obtenir_valors_d_una_data(data_viaje='18-07-2025'):
    chrome_options = Options()
    chrome_options.add_argument('--headless')  # treu això si vols veure-ho en viu
    chrome_options.add_argument('--disable-gpu')

    driver = webdriver.Chrome(options=chrome_options)

    aveStationIds = {
        'Girona': 105,
        'Sants': 112
    }

    aveServeiId = 23190

    try:
        # Canvia aquests valors segons l'origen i destí
        url = f"https://renfeviajes.renfe.com/es/CompraDestino/9799?dateFrom={data_viaje}&dateTo={data_viaje}&departureStation={aveStationIds['Girona']}&destinationStation={aveStationIds['Sants']}&numTicketsAdults=1&numTicketsChildren=0&numTicketsBabies=0&soloIda=true&data=[{{%22date%22:%22{data_viaje.replace('-', '')}%22}},{{%22selects%22:[{{%22{aveServeiId}%22:%221%22}}]}}]&showPriceTrain=false&allTrains=true"

        driver.get(url)
        time.sleep(10)  # espera per carregar XHRs

        for request in driver.requests:
            if request.response:
                if 'queryNewAPIProceso' in request.url:
                    valors = extreure_valors_d_una_url(request.url)
                    print("🔍 Dades trobades:")
                    print(json.dumps(valors, indent=4))
                    break
        else:
            print("❌ No s'ha trobat cap petició a queryNewAPIProceso.")

    finally:
        driver.quit()

# Executar amb data desitjada
obtenir_valors_d_una_data('18-07-2025')
