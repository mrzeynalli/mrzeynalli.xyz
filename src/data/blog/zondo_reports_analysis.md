---
author: Elvin Zeynalli
pubDatetime: 2023-01-04T18:33:53+03:00
title: "Zondo Reports Text Analysis"
postSlug: zondo-reports-text-analysis
featured: false
draft: false
tags:
  - Data Analytics
  - Text Analytics
  - Data Visualization
  - Python
  - NLTK
description: "An A-grade University of Edinburgh project utilizing Python and NLTK to analyze one exabyte of evidence from South Africa's Zondo Commission, identifying the most frequently mentioned publicly traded companies."
---

**Project description**
- *Language:* Python
- *Working file:* Jupyter notebook

---

In 2018, former President of South Africa, Jacob Zuma, established a commission of enquiry in state capture, known as The Judicial Commission of Inquiry into Allegations of State Capture, Corruption and Fraud in the Public Sector including Organs of State, or simply the Zondo Commission. The commission collected one exabyte of evidence, and on 22 June 2022 released its final report. The reports are available publicly in this link.

![Image is taken from www.corruptionwatch.org.za](src/assets/images/zondo_reports/1.jpeg)
*Image is taken from [www.corruptionwatch.org.za](https://www.corruptionwatch.org.za)*

This project aims to analyze the contents of these reports to capture the names of publicly traded companies whose names are mentioned more frequently. The results would be beneficial for prudent investors who seek ethical investments opportunities in South Africa.

## Data Collection and Cleaning

Two datasets were used in this project. First dataset were created by converting the report .pdf files into .csv format. *PyPDF2* module was used for transforming each pdf content into a text-formatted object, and *Pandas* was used to store those text-formatted objects into a dataframe. The final dataset of the texts were converted to .csv file and uploaded to [Github](https://github.com/mrzeynalli/Zondo-Reports-Analysis/blob/main/Datasets/Zondo_Reports.csv), where the file's raw format was used.

```python
import pandas, PyPDF2

# storing all the pdf files in a list
report_paths = 
['OCR version - State Capture Commission Report Part 1 Vol I.pdf', 
'OCR version - State Capture Commission Report Part II Vol II.pdf',
'OCR version - State Capture Commission Report Part III Vol I - Bosasa.pdf',
'OCR version - State Capture Commission Report Part III Vol II - Bosasa.pdf',
'OCR version - State Capture Commission Report Part III Vol III - Bosasa.pdf',
'OCR version - State Capture Commission Report Part III Vol IV - Bosasa.pdf',
'OCR version - State Capture Commission Report Part IV Vol I - NT,EOH,COJ,Alexkor.pdf',
'OCR version - State Capture Commission Report Part IV Vol II- FS.pdf',
'OCR version - State Capture Commission Report Part IV Vol III - Eskom.pdf',
'OCR version - State Capture Commission Report Part IV Vol IV - Eskom.pdf',
'OCR version - State Capture Commission Report Part V Vol I - SSA.pdf',
'OCR version - State Capture Commission Report Part V Vol II - SABC,Waterkloof,Prasa.pdf',
'OCR version - State Capture Commission Report Part VI Vol I - Estina,Vrede.pdf',
'OCR version - State Capture Commission Report Part VI Vol II - CR.pdf',
'OCR version - State Capture Commission Report Part VI Vol III - Flow of Funds.pdf',
'OCR version - State Capture Commission Report Part VI Vol IV - Recommendations.pdf']

# creating a dataframe file
zondo_reports = pd.DataFrame(columns=['report', 'text'])
i = 0

# iterating through the pdf list
for path in report_paths:

    # converting each pdf content into a text object
    pdfFileObj = open(path, 'rb')
    print('opened', path)
    pdfReader = PyPDF2.PdfReader(pdfFileObj)
    text=''
    for page in pdfReader.pages:
        text += page.extract_text()
    print('extracted text for', path)

    # adding the converted text objects into dataframe
    zondo_reports.loc[i] = [path, text]
    i+=1
    pdfFileObj.close()
    print('closed', path)
```

After obtaining the first dataset, we needed another dataset consisting of the companies that are publicly traded in South Africa. For this objective, we used Johannesburg Stock Exchange (JSE) portal to pick up the candidate companies. January 2021 dataset of the companies were downloaded from the JSE website in .xlsx format. The file then were re-formatted into .csv to be readable from GitHub. The .csv file was uploaded to my [GitHub account](https://github.com/mrzeynalli/Zondo-Reports-Analysis/blob/main/Datasets/Complete-List-of-Listed-Companies-on-South-Africa-Johannesburg-Stock-Exchange-Jan-2021.csv), and its raw format was called using read_csv method of Pandas.

As of now, we have a dataset containing reports contents and a dataset containing the publicly traded companies in South Africa.

## Analysis

To carry out the text analysis, nltk module was primarily used. The below code displays how different classes of that module were imported:

```python
import nltk, string

from nltk.tokenize import word_tokenize
nltk.download('punkt')

from nltk.corpus import stopwords
nltk.download('stopwords')

from nltk.probability import FreqDist
```

Firstly, we used *word_tokenize* function to tokenize all the reports contents into a single variable. Although the best practice is to lowercase all the tokens, we intentionally left the words as they were, given the fact that we were looking for company names, which are proper nouns. Thus, leaving proper nouns as they were was a better choice for the analysis.

To get rid of unnecessary words, we created a variable consisting of stop words from *nltk.corpus* and punctuations from *string* module. Further, some additional junk words were added to be removed from the tokens.

```python
# remove some stops from the tokens
junk_tokens = ['Mr','Ms','Dr','P','``', '\'s','\'','\'\'','\'\'\'','"','"','................................','L']

removables = set(stopwords.words('English') + list(string.punctuation) + list(string.digits) + junk_tokens)

filtered_tokens = [token for token in all_content_tokens if token not in removables]
```

Numerous company names come with additional descriptive words attached to them such as 'Holding', 'Corporation', 'Limited', and etc. We created a function that checks the name for each company and leaves those additions out. The new names were added to the dataframe under a column name 'search term'. Afterwards, finally, time came for searching for company names (using the search terms) inside the reports (texts that are stored in the first dataframe).

For companies with one search term, we just searched the tokens as they are single words. For the companies with two or three words in their names, we used *bigrams* and trigrams from *nltk*, respectively. An additional column was added to the dataframe indicating True if the company name is mentioned in the reports and False otherwise.

```python
# Bigrams and trigrams are created to search for two-word and three-word search terms individually.
bigrams = list(nltk.bigrams(filtered_tokens)) 
trigrams = list(nltk.trigrams(filtered_tokens)) 

# Create new column that will store whether a company name is mentioned or not.
listed_companies["FoundInReport"] = "False"


for ind in listed_companies.index:
    searchterm = listed_companies['SearchTerm'][ind]
    if len(searchterm) == 1:
        if searchterm[0] in filtered_tokens:
            # search for one-word search terms
            print('1 word company appeared in text:', searchterm)
            listed_companies.at[ind,'FoundInReport'] = True
    if len(searchterm) == 2:
        if searchterm in bigrams:
            # search for two-word search terms
            print('2 word company appeared in text:', searchterm)
            listed_companies.at[ind,'FoundInReport'] = True
    if len(searchterm) == 3:
        if searchterm in trigrams:
            # search for three-word search terms
            print('3 word company appeared in text:', searchterm)
            listed_companies.at[ind,'FoundInReport'] = True
```

Next, we used *FreqDist* function from *nltk.probability* to calculate how many times each company name is mentioned in all reports combined.

## Results

*Matplotlib* and *seaborn* libraries were used for the purpose of visualization. The following figures were drawn to illustrate the results.

*Figure 1: The frequency of company name mentions by sector*
![Figure 1: The frequency of company name mentions by sector](src/assets/images/zondo_reports/2.jpeg)

**Figure 1** shows how many times the names of companies in each sector is mentioned in the reports. Banking companies top the chart, by having 236 name mentions in total. It is followed by Mining, Software&Computing Services, and Media, by being mentioned 197, 110, and 76 times, respectively.

*Figure 2: Frequency of mentions for company*
![Figure 2: Frequency of mentions for company](src/assets/images/zondo_reports/3.jpeg)

**Figure 2** clearly depicts the company names that were mentioned in the reports. Glencore Plc is the company with the highest quantity of mentions (190). Standard Bank Group Limited and Nedbank Group Limited are the main banks whose names are widely used in the reports. The following are the EOH Holding Limited and MultiChoice Group Limited.

---

> **Note:** It is important to note that the results of this analysis do not impose any kind of allegation against any of the companies mentioned above. As a matter of fact, the analysis focuses on the numerical counts rather than the context of the mentions. More clearly, it does not claim that the company names are mentioned in a negative manner. Thus, this project has only one primary purpose to be a guide for the investors. Additional in-depth research is up to the investors when they ponder of investing on those firms.