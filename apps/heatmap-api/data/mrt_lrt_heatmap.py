import pandas as pd
import numpy as np
import requests
import json
import seaborn as sns
import folium
from folium.plugins import HeatMap
from folium import Figure
import matplotlib.pyplot as plt
import json

API_KEY = 'XdXrX0plSgelmt9TRxFpmA=='
API_URL = 'https://datamall2.mytransport.sg/ltaodataservice/PCDRealTime?TrainLine='
TAXI_API_URL = 'https://datamall2.mytransport.sg/ltaodataservice/Taxi-Availability'

TrainLine = ['CCL','CEL','CGL','DTL','EWL','NEL','TEL','BPL','SLRT','PLRT']

headers = {
    'AccountKey': API_KEY,
    'Accept': 'aplication/json'
}

columns_to_drop = ['StartTime','EndTime']
response = requests.get(API_URL+'NSL', headers=headers)
record_list = response.json().get('value',[])
final_data = pd.json_normalize(record_list)
crowd_time = final_data['StartTime'][0]
final_data = final_data.drop(['StartTime','EndTime'],axis=1)

for i in TrainLine:
    response = requests.get(API_URL+i, headers=headers)
    record_list = response.json().get('value',[])
    data = pd.json_normalize(record_list)
    data = data.drop(['StartTime','EndTime'], axis=1)
    final_data = pd.concat([final_data,data], ignore_index=True, axis=0)

final_data = final_data.rename(columns={'Station':'STN_NO'})

response = requests.get(TAXI_API_URL, headers=headers)
taxi_record_list = response.json().get('value',[])
taxi_data = pd.json_normalize(taxi_record_list)
# taxi_data.to_csv('taxi_data.csv',index=False)
# print(taxi_data)


# print("AT DATE and TIME: ",time)
# print(final_data)
# final_data.to_csv('final_data.csv',index=False)


#########################################################################################################


# final_data = pd.read_csv('final_data.csv')
# taxi_data = pd.read_csv('taxi_data.csv')
# crowd_time = 00

raw_data = pd.read_csv('mrt_stations.csv')
# raw_data['CrowdLevel_raw'] = 1
# print('Total Stations:', len(raw_data))
# condition = raw_data['STN_NO'].str.startswith('EW')
# raw_data['Crowd Density'] = np.where(
#     condition,
#     2,
#     1
# )

crowd_mapping = {'l': 0.1, 'm': 0.5, 'h': 1.0}
final_data['CrowdLevel'] = final_data['CrowdLevel'].map(crowd_mapping)

raw_data = raw_data.drop(['Unnamed: 0','OBJECTID'],axis=1)

merged_data = raw_data.merge(
    final_data[['STN_NO','CrowdLevel']],
    on='STN_NO',
    how='left'
)

print(merged_data.head())
merged_data.to_csv('merged_data.csv',index=False)
sidebar_data = merged_data[[
    'STN_NO',
    'STN_NAME',
    'CrowdLevel'
]].rename(columns={'CrowdLevel': 'Crowd Density (1-3)'})

sidebar_json = sidebar_data.to_json(orient='records')

fig = Figure(width='100%',height='100%')

# print(raw_data.isna().sum())

singapore_map = folium.Map(location=[1.3521, 103.8198], zoom_start = 12, tiles="cartodbdarkmatter")

mrt_coord = merged_data[['Latitude', 'Longitude', 'CrowdLevel']]#.values.tolist()#.dropna(subset=['Latitude', 'Longitude']).values.tolist()
taxi_coord = taxi_data[['Latitude', 'Longitude']]

mrt_heatmap = HeatMap(mrt_coord, radius=10, gradient={0.1:'blue',0.5:'yellow', 1:'red'})
mrt_heatmap.add_to(singapore_map)
taxi_heatmap = HeatMap(taxi_coord, radius=5, gradient={0:'blue',1:'yellow'})
taxi_heatmap.add_to(singapore_map)

fig.add_child(singapore_map)
singapore_map.save("Map.html")


html_with_sidebar = f"""
<!DOCTYPE html>
<html>
<head>
    <title>MRT Crowd Map & Data</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {{ margin: 0; padding: 0; overflow: hidden; }}
        #map {{ position: absolute; top: 0; left: 0; right: 0; bottom: 0; }}
        #sidebar {{
            position: fixed;
            top: 10px;
            right: 10px;
            width: 350px;
            height: 95vh;
            background: white;
            padding: 15px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 1000;
            border-radius: 8px;
            font-family: Arial, sans-serif;
            overflow-y: auto;
        }}
        .sidebar-header {{ font-size: 1.25em; font-weight: bold; margin-bottom: 10px; color: #333; }}
        #data-table th, #data-table td {{ padding: 8px; border-bottom: 1px solid #ddd; text-align: left; font-size: 0.85em; }}
        #data-table th {{ background-color: #f2f2f2; font-weight: 600; color: #555; }}
        .crowd-low {{ background-color: #d1e7ff; }}
        .crowd-medium {{ background-color: #fff3cd; }}
        .crowd-high {{ background-color: #f8d7da; }}
    </style>
</head>
<body>
    <div id="map">
        {fig.render()}
    </div>
    
    <div id="sidebar">
        <div class="sidebar-header">MRT Station Data</div>
        <p style="font-size: 0.9em; margin-bottom: 10px;">
            Crowd data last updated: <strong>{crowd_time}</strong>
        </p>
        <table id="data-table" style="width: 100%; border-collapse: collapse;">
            <thead>
                <tr>
                    <th>STN</th>
                    <th>Name</th>
                    <th style="text-align: center;">Density</th>
                </tr>
            </thead>
            <tbody>
                <!-- Data will be inserted here by JavaScript -->
            </tbody>
        </table>
    </div>

    <script>
        // 1. Embedded JSON Data
        const stationData = {sidebar_json}; 

        // 2. Function to render the table
        function renderTable() {{
            const tableBody = document.querySelector('#data-table tbody');
            tableBody.innerHTML = ''; // Clear existing rows

            stationData.sort((a, b) => a['STN_NO'].localeCompare(b['STN_NO']));

            stationData.forEach(station => {{
                const row = tableBody.insertRow();
                const level = station['Crowd Density (1-3)'];
                let crowdClass = '';

                if (level === 1) {{
                    crowdClass = 'crowd-high';
                }} else if (level === 0.5) {{
                    crowdClass = 'crowd-medium';
                }} else {{
                    crowdClass = 'crowd-low';
                }}
                
                // Add CSS class to row based on crowd level
                row.className = crowdClass;

                // Cell 1: STN_NO
                row.insertCell().textContent = station['STN_NO'];
                
                // Cell 2: STN_NAME
                row.insertCell().textContent = station['STN_NAME'];
                
                // Cell 3: Crowd Density
                const densityCell = row.insertCell();
                densityCell.textContent = level;
                densityCell.style.textAlign = 'center';

            }});
        }}

        // Run the rendering function when the page loads
        document.addEventListener('DOMContentLoaded', renderTable);
    </script>
</body>
</html>
"""

# Save the final HTML with the injected code
with open('Map.html', 'w') as f:
    f.write(html_with_sidebar)

