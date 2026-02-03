---
author: Elvin Zeynalli
pubDatetime: 2023-01-05T18:33:53+03:00
title: "Non-capital UK Cities with High-tech Potential"
postSlug: uk-cities-high-tech-potential
featured: true
draft: false
tags:
  - Data Analytics
  - Data Science
  - Data Visualization
  - Companies House
  - API Development
  - Web Scraping
description: "A data-driven analysis of Companies House records to identify emerging UK tech hubs outside of London. This project uses custom API scraping and SIC code filtering to rank cities by tech firm density and growth."
---

This project is carried out by me under a final assignment for one of my courses at the University of Edinburgh. The project received an A grade.

---

**Project description**
- *Language:* Python  
- *Libraries:* requests, pandas, numpy, matplotlib, seaborn, os, math, time, datetime, json  
- *IDE:* Microsoft Visual Studio Code, Jupyter Notebook  
- *Project type:* Data analytics, Web scraping, API  

[**Companies House**](https://www.gov.uk/government/organisations/companies-house) is an agency formed by the British Government to maintain the registration of all the companies in the UK. It maintains a database that stores the information of the registered companies. Each company has features such as company name, Standard Industrial Classification (SIC) code, creation date, cessation date (if ceased operating), company board and shareholder info, etc. By using an API, it is possible to scrape the data from that database by using various specifications.

This project aims to scrape the data of the tech companies in the UK and figure out the main tech areas (cities) besides London, the capital of the UK. The idea is to decentralize the tech processes from the capital city. The results of this project can be beneficial for people seeking low-competitive employment in the tech sphere or investors seeking conservative investment options in the UK tech arena.

![Photo by Rodrigo Santos on Unsplash](src/assets/images/uk_cities_tech_potential/1.webp)  
*Photo by Rodrigo Santos on Unsplash*  

## Data Collection and Cleaning

The project uses the *requests* library to request the data from Companies House. Next, the scraped data is converted into *json* format, after which the companies' data from different pages are combined into one single dataframe. The following libraries are imported to achieve the whole analysis process:  

```python
# Import necessary libraries for this project
import pandas as pd
import numpy as np
import requests as rq # to request data
import json
import math
import time
import datetime as dt

# Modules for visualization
import matplotlib.pyplot as plt
import seaborn as sns

import warnings
warnings.filterwarnings('ignore') # Imported to ignore warnings
```

A sophisticated class object was created with a function that calls the data from the database and returns the dataframe object that stores the companies' information. By applying this to numerous pages, it is possible to scrape as many companies' data as intended.  

```python
# Create a class that calls the API
class api_caller:
    
    # Root url for Companies House database
    root_url = 'https://api.companieshouse.gov.uk/'
    
    # API key
    key = "YOU API KEY"
    
    # Create a function that returns the dataframe of the companies found for the selected url
    def return_dataframe(self,url_extention):
        
        # Create a url variable that combines the selected url to root url
        url = self.root_url + url_extention
        
        # Request a response from the url with the API key
        query_result = rq.get(url, auth=(self.key,''))
        
        # Check if the response of the request is successful (which is denoted with code 200)
        if query_result.status_code == 200:
            
            # Create a json file by decoding the response
            json_file = json.JSONDecoder().decode(query_result.text)
            
            # Create a variable that stores only items from the json file
            items_file = json_file['items']
            
            # Create a variable that stores the keys from the items file
            keys = items_file[0].keys()

            # Create the dataframe with companies as data and keys as columns
            companies_df = pd.DataFrame(items_file,columns = keys)
            
            # Return the created dataframe
            return companies_df
        
        else: # if the response code is not 200, return none (non-200 code, either 400 or 405, means either the request is not
              # correctly asked or there is not such a url. This is helpful on tackling the error when my upcoming return_companies
              # function goes into further pages to quest companies where there is no longer any companies listed)
            return None
```

SIC code is a 5-digit code that categorizes each company based on the economic activity they carry on. They were used as main features to call the companies for a selected economic area. [The full list of SIC](https://resources.companieshouse.gov.uk/sic/) codes is publicly available on the Companies House website. I formulated the csv file of those codes and uploaded it to [my GitHub account](https://github.com/mrzeynalli/company_houses_analysis/blob/main/datasets/sic_codes_list.csv), whose raw format I can call later inside my working file. The SIC codes csv file contains two columns: SIC code and respective industry name.  

Later, I created two additional functions that call companies based on one or multiple SIC codes. It is important to note that the first function calls the companies based on one SIC code and returns one dataframe containing their information. The second one calls the companies based on multiple SIC codes, using the first function for each of them, and returns one dataframe, which is a combination of all dataframe for each individual SIC code. This way, I could simply put the list of SIC codes (usually one economic area, say technology, has more than one SIC code), and the function returns the dataframe entailing the data for all the companies that go under those SIC codes.  

```python
# Create a function that returns the companies based on one single SIC code 
# and the number of expected companies
def return_companies_on_sic_code(sic_code, number_of_companies):
    
    # Round up number of pages
    number_of_pages = math.ceil(number_of_companies / 20)
    
    # Create an empty dataframe as a general dataframe to store further companies
    companies_data = pd.DataFrame()
    
    # Iterate through the pages
    for page_index in range(0, number_of_pages):
        
        # Create the url extention that checks for sic_code based on 20 companies per page and page starting 
        # index of the last companies in the previous page
        url = f"advanced-search/companies?sic_codes={sic_code}&items_per_page=20&start_index={page_index*20}"
        
        # Store the companies collected in one particular page
        page_data = api_caller().return_dataframe(url)
        
        # Add the one-page collected companies dataframe to the general dataframe
        companies_data = pd.concat((companies_data,page_data),axis=0)
        
        # Sleeps for 0.4 seconds not to crash into time errors
        time.sleep(0.4)
    
    # Return the general dataframe
    return companies_data.reset_index(drop=True)


###########################################################################################################################


# Create a function that returns the companies based on multiple single SIC codes 
# and the number of expected companies
def return_companies_on_multiple_sic_codes(sic_codes_list, number_of_companies):
    
    # Create an empty dataframe as a general dataframe to store further companies
    companies_data = pd.DataFrame()
    
    # Iterate through the input sic codes
    for sic_code in sic_codes_list:
        
        # Use the previously created one-sic-code-based companies returning function to return multiple-pages companies
        # each sic code
        companies_data_for_sic_code = return_companies_on_sic_code(sic_code, number_of_companies)
        
        # Add the companies for one sic code to general dataframe
        companies_data = pd.concat((companies_data,companies_data_for_sic_code),axis=0)
        
        # Sleeps for 0.4 seconds not to crash into time errors
        time.sleep(0.4)
    
    # Return the general dataframe
    return companies_data.reset_index(drop=True)
```

Additionally, I created another function that requires a list of intended industry names as an input, then goes through the SIC codes csv file explained earlier, and returns a list of the SIC codes that are related to that specified names. As the respective industry names for SIC codes are usually large and contain multiple words, the function checks if every single one of the input names takes part inside the industry names for SIC codes.  

```python
# Create a function that returns the list of SIC Codes based on the selected keywords for industry names 
def words_dependent_sic_codes(search_words_list):
    
    # Create an empty list to store further SIC Codes
    sic_codes = []
    
    # Iterate through all industry names in SIC Codes dataframe
    for industry in sic_codes_df['Description']:
        
        # Iterate through each search_word and removable_word
        for search_word in search_words_list:
            
            # Check if the search word is in industry name
            if search_word in industry.lower():

                # Create a dataframe condition to call specific industry
                condition = (sic_codes_df['Description'] == industry)

                # Store the SIC Code of that specific industry
                sic_code = sic_codes_df[condition]['SIC Code'].values

                # Convert the stores SIC Code into integer
                sic_code_int = int(sic_code)

                # Add the integer SIC Code into SIC Codes list
                sic_codes.append(sic_code_int)
                
    # Remove the duplicated SIC Codes by converting list into set and back to list            
    sic_codes = list(set(sic_codes))
    
    # Return the SIC Codes list
    return sic_codes
```

## Analysis  

After preparing the pre-collection functions, I began by calling the SIC codes for technology companies. I input a list of tech search words including *'technology'*, *'engineering'*, *'software'*, and *'hardware'* into a SIC-codes-calling function and received the codes for the companies that fell under the industries that correspond to my specified search words. I specified to return up to 1000 companies for each SIC code. Presumably, this method was prone to calling the same companies from different SIC codes, given the fact that some companies in the database are attached to multiple SIC codes. Thus, I removed the duplicates with respect to the 'company_name' column that plays the role of a unique identifier.  

One interesting problem was that one of the columns returned from the database was an address column, whose values were a dictionary storing the address info, including locality and postal code. So, it was necessary to split these values into different columns. I built up another function that handles this objective.  

```python
# Create a 'locality' and 'postal_code' columns out of 'registered_office_address', which is a dictionary in a dataframe
columns_to_be_splitted = ['locality','postal_code']

# Define a function that splits the given column
def cell_dict_splitter(key, column, dataframe):

    dataframe[key] = dataframe[column].str[key]

# Iterate through the candidate columns
for key in columns_to_be_splitted:
    
    # Split the candidate columns
    cell_dict_splitter(key,'registered_office_address',tech_companies_df)
    
# Drop 'registered_office_address' column given it has already been processed
tech_companies_df.drop(columns=['registered_office_address'], inplace=True)
```

Newly formed *'locality'* column provides the city names that the respective companies were launched in. This will help me to group the companies by their cities to see which cities are distinguished with higher counts of tech companies.  

Next, I filtered the companies on a condition to keep the cities what are not London. I did this process by using the previously created filtering class, which has unfiltering option (I defined 'unfiltering' as a process to filter out the selected condition. I unfiltered the companies by filtering out the ones launched in London). For the next step, I used *groupby* method from *pandas* to group the counts of tech companies by their city.  

## Results

*Matplotlib* and *seaborn* libraries were used for the purpose of visualization. The following figures were drawn to illustrate the results.  

![Figure 1: Proportion of Tech Companies in TOP10 Non-Capital Cities of UK](src/assets/images/uk_cities_tech_potential/2.webp)  
*Figure 1: Proportion of Tech Companies in TOP10 Non-Capital Cities of UK*  

**Figure 1** displays the 10 non-capital UK cities that have the highest proportion of tech companies. Manchester, Birmingham, and Bristol are the main non-capital cities with tech firms. They, respectively, capture 19.1%, 14.0%, and 10.6% of the total distribution of tech companies for non-capital cities. They are followed by Cambridge (10.6%), Nottingham (8.9%), and Cardiff (8.0%). Leeds, Coventry, Reading, and Sheffield are the other cities that made it to TOP10.  

![Figure 2: Tech Companies in TOP 10 Non-Capital Cities of UK per Company Status](src/assets/images/uk_cities_tech_potential/3.webp)  
*Figure 2: Tech Companies in TOP 10 Non-Capital Cities of UK per Company Status*  

Regarding active tech companies, Birmingham leads the way with above 120 companies, passing Manchester and Cambridge, both of which have nearly 100 active tech firms. While not huge variations are experienced with the rest of the cities, Coventry is found to have the lowest number of active firms (**Figure 2**).  

Overall, Manchester, Birmingham, Bristol, and Cambridge are the main recommended cities for people who quest a non-aggressive tech firm launch or less-competitive tech job.