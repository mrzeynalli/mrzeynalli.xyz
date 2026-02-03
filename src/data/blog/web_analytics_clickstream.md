---
author: Elvin Zeynalli
pubDatetime: 2023-03-15T18:33:53+03:00
title: "Web Analytics: Analyzing clickstream of 160,000 visitors"
postSlug: web-analytics-clickstream-analysis
featured: true
draft: false
tags:
  - Web Analytics
  - Data Analytics
  - Data Visualization
  - Social Media Analytics
  - Python
description: "A comprehensive analysis of 160,000 visitor clickstreams using Python. This project evaluates marketing campaign performance by calculating conversion, drop-out, and bounce rates across different traffic sources and platforms."
---

**Project description**
- *Language:* Python
- *Working file:* Microsoft Visual Studio Code
- *Project type:* Web Analytics

---

Companies receive traffic to their website from various resources. The more a company learns about the visitors' traffic to its website, the better it understands the reasons behind their travel to the website. Besides the number of visitors to a website, it is important to learn from which sources those people arrive at the website. This can help the firms to see which external social account or network campaign is prone to bringing new customers. Furthermore, a company can also see the patterns in the behaviour of the visitors on different pages. By using various page analytics techniques, successful as well as problematic pages can be detected.

![Photo by Adem AY on Unsplash](src/assets/images/website_analytics_clickstream/1.webp)  
*Photo by Adem AY on Unsplash*

In this project, I used web analytics techniques to analyze the potential of three marketing campaigns run by a hypothetical company.

## Data description and conversion
### Description
The dataset consists of 160,000 rows, each corresponding to a different visit to a website and its clickstream — the pages the visitor entered. Each row also has corresponding *'origin'* and *'platform'* info. The *'origin'* value indicates through which source a user ended up on the website. Each origin value is one of the 7 different sources (the first three being paid champaigns):

- **Facebook advertisement:** When a user clicks on an ad that has been posted on Facebook.
- **LinkedIn advertisement:** When a user clicks on an ad that has been posted on LinkedIn.
- **Partner advertisement:** When a user clicks on an ad on a partner's website.
- **Facebook share:** When a user clicks on a post that has been shared by a friend on Facebook.
- **LinkedIn share:** When a user clicks on a post that has been shared by a friend on LinkedIn.
- **Direct:** When a user directly types the website's URL into their browser.
- **Search:** When a user finds the website by entering a search term into a search engine.

The platform values are either *'windows'*, *'mac'*, *'android'*, *'ios'* or *'unknown'*. The latter is a result of the case in which the platform is not detected (due to various reasons such as the presence of an ad-blocker or VPN).

### Converstion
The data is presented in a CSV file with two columns: the first indicates the origin and the second indicates the platform. The remaining columns to the right indicate the pages the user visited. Since not all rows have the same number of columns, a different data convention is needed for analysis. To achieve this, the function *"generate_data_dict"* takes a line as input and returns the values stored under their corresponding key in a dictionary. This function is used for each row in the dataset. After reading the dataset using the *open()* function in Python and using the *readlines()* method to convert each row into a line, I iterated through each row to obtain the values using the aforementioned function. The values for each visit were stored in a separate list created to contain all the visit info. After retrieving all visit values and closing the dataset file, I converted the list into a dataframe using the *data* argument, which was equal to the list. Since the list values were in a dictionary format, the keys were automatically constructed as columns, thus there was no need to add the *columns* argument separately. The data conversion codes are given below:

```python
# Define a function that converts a into a line and stores the values accordingly
def generate_data_dict(line):
    
    line = line.rstrip("\n") # convert the row into a line by stripping over a new-line character
    data_rows = line.split(",") # split the values in the row by comma chacater
    
    # Return the value for each feature in a dictionary format
    return {'Source': data_rows[0], # the first value in a row - origin/source
            'Platform': data_rows[1], # the second value in a row - platform
            'Clickstream': data_rows[2:], # the remaining values in a row - pages visited
            '# of pages visited': len(data_rows[2:]),}   # the count of the pages visited

##########################################################################################################

# Create a list that wil store the values for each visit
visitor_data_list = []

with open('visitor_data_clickstream.csv', 'r') as file: # open the dataset file
    rows = file.readlines() # read each row in the dataset
    
    for row in rows: # iterate through the rows
        data_dict = generate_data_dict(row) # store the values for each row intoa dictionary
        visitor_data_list.append(data_dict) # add the values into a list

file.close() # close the dataset file

# Convert the visit values into a dataframe
visitor_data_df = pd.DataFrame(data=visitor_data_list)
```

## Web analytics techniques

Now that we have an intended dataframe of the clickstream on hand, it is time to start the analytics. But before, we need to discuss certain web analytics metrics. In practice, web analytics is usually carried out by observing a visitor's behaviour over pages. Conversion, drop-out, and bounce rates were used in this project to analyze the pages.

- **Conversion rate** shows the proportion of visitors that ended their visits successfully by carrying out a purchase (or any other intended outcome)
- **Drop-out rate** shows the proportion of visitors that entered the purchase page (or the processing page of any other intended outcome) but left without finishing
- **Bounce rate** shows the proportion of visitors that visited only one page and bounced away immediately

Basically, each visit can be tagged if it has ended in one or more of the ways outlined above. I decided to add a separate column for each metric and tag 1 or 0, depending on whether the selected scenario (success, drop-out, bounce) happened in that particular visit. The below code shows how the columns and their indications are added to the dataframe:

```python
purchase_success_status_list = [] # create a list to visits that ended up in success
drop_out_status_list = [] # create a list to visits that dropped out
single_page_status_list = [] # create a list to visits that visited only one page

# iterate through the indices of the dataframe
for index in visitor_data_df.index:

    clickstream_list = visitor_data_df.loc[index]['Clickstream'] # seperate the clickstream value, i.e., pages visited

    if 'purchase_success' in clickstream_list: # if the visit was successful, i.e., contains 'purhcase_success' page
        purchase_success_status_list.append(1)  # add 1 if YES
    else:  
        purchase_success_status_list.append(0) # add 0 if NO
        
    if 'purchase_start' in clickstream_list and 'purchase_success' not in clickstream_list: # if the visit was dropped out, i.e., entrance into purchasing page without a success
        drop_out_status_list.append(1) # add 1 if YES
    else:  
        drop_out_status_list.append(0) # add 0 if NO

    if len(clickstream_list) == 1: # if the visit contains only 1 page. i.e., a visitor bounced after a single page visit
        single_page_status_list.append(1) # add 1 if YES
    else:  
        single_page_status_list.append(0) # add 0 if NO
    
# add the respective list values into the dataframe
visitor_data_df['Conversion'] = purchase_success_status_list
visitor_data_df['Drop-out'] = drop_out_status_list
visitor_data_df['Bounce'] = single_page_status_list
```

Simply, I created three lists for each metric and, by iterating through the indices of the dataframe, where an index is an individual visit, I checked if the clickstream of that visit had the relevant pages. Either 1, indicating a positive response, or 0, indicating a negative response, was added correspondingly.

- **Conversion** — if the clickstream has a 'purhcase_success' page, it means the visitor made a purchase successfully
- **Drop-out** — if the clickstream has a 'purchase_start' page but not a 'purhcase_success' one, it means the visitor entered the purchasing processing page but didn't make a purchase for some reason
- **Bounce** — if the length of the clickstream is equal to 1, it means the visitor didn't visit more than 1 page

These columns only indicate whether an individual visit ended in one or more of the mentioned ways. Yet, I needed to calculate and see ratios for each platform or source. To achieve this, I created a function, which required three input values, numerator, denominator, and dataframe, and returned ratio values:

```python
# Create a function that returns a ratio for a given metric given numerator, denominator, and dataframe
def generate_ratio(numerator, denominator, dataframe):
    
    ratios = [] # Create a list to store the ratio values
    
    for index in dataframe.index: # For each index

        numerator_value = dataframe.at[index, numerator] # Take the numeric from that index
        denominator_value = dataframe.at[index, denominator] # Take the denominator from that index

        ratio = numerator_value / denominator_value # Calculate the ratio

        ratios.append(round(ratio,2)) # Round the ratio into two decimal points
        
    return ratios # Return the ratios list
```

However, I needed to have a dataframe with summed values for each metric (numerator), which then would be divided by the total visit (denominator). For this purpose, corresponding to my project's two main analytical directions (analyzing Source and Platform), I used *groupby()* method of dataframe to create two new dataframe objects, indexed by their columns and summing their respective numeric values. Then, I added the total number of visits for each Source and Platform:

```python
# Groupyby all the values by source, summing the numeric values only
source_group_df = visitor_data_df.groupby('Source').sum(numeric_only=True)

# Create a list that stores the total number of visits per source
number_of_visits_per_source = list(visitor_data_df.groupby('Source').count()['Platform'])

# Add the total visits to the grouped by dataframe
source_group_df['Total Visits'] = number_of_visits_per_source

###############################################################################################

# Groupyby all the values by platform, summing the numeric values only
platform_group_df = visitor_data_df.groupby('Platform').sum(numeric_only=True)

# Create a list that stores the total number of visits per platform
number_of_visits_per_platform = list(visitor_data_df.groupby('Platform').count()['Source'])

# Add the total visits to the grouped by dataframe
platform_group_df['Total visits'] = number_of_visits_per_platform
```

Now we have two useful dataframe objects and a function to generate ratios, by clarifying the columns whose ratios will be calculated, I added the ratios of all three metrics (by dividing the sums of 1's by the total visits) to each dataframe:

```python
# Create the list for columns whose ratios will be calculated
list_of_columns_for_ratio_calculation  = ['Conversion', 'Drop-out', 'Bounce']


# ADD RATIOS FOR THE DATAFRAME GROUPED BY SOURCE

# Iterate through the columns list
for column in list_of_columns_for_ratio_calculation:
    
    # Formulate the column name by adding ratio in the front
    column_name = column + ' rate'
    
    # Generate the ratios and add to the dataframe under the formulated column name
    source_group_df[column_name] = generate_ratio(column, 'Total Visits', source_group_df) 


# ADD RATIOS FOR THE DATAFRAME GROUPED BY PLATFORM

# Iterate through the columns list
for column in list_of_columns_for_ratio_calculation:
    
    # Formulate the column name by adding ratio in the front
    column_name = column + ' rate'
    
    # Generate the ratios and add to the dataframe under the formulated column name
    platform_group_df[column_name] = generate_ratio(column, 'Total visits', platform_group_df)
```

## Results
### Over tables

*Table 1: The Visit Statistics per Source*
| Source | # of pages visited | Conversion | Drop-out | Bounce | Total Visits | Conversion rate | Drop-out rate | Bounce rate |
|--------|--------------------|------------|----------|--------|--------------|-----------------|---------------|-------------|
| direct | 47724 | 4275 | 1191 | 1287 | 13500 | 0.32 | 0.09 | 0.10 |
| facebook_advert | 19334 | 93 | 2728 | 4262 | 10000 | 0.01 | 0.27 | 0.43 |
| facebook_share | 177253 | 6657 | 12345 | 8125 | 51300 | 0.13 | 0.24 | 0.16 |
| linkedin_advert | 8292 | 504 | 896 | 0 | 2000 | 0.25 | 0.45 | 0.00 |
| linkedin_share | 71015 | 2546 | 4913 | 4239 | 21200 | 0.12 | 0.23 | 0.20 |
| partner_advert | 19034 | 545 | 3000 | 0 | 5000 | 0.11 | 0.60 | 0.00 |
| search | 188925 | 8720 | 12127 | 10537 | 57400 | 0.15 | 0.21 | 0.18 |

**Table 1** presents comprehensive visit statistics that have been carefully filtered by source. The data shows the number of visitors, conversion, drop-out, and bounce rates for each source, giving you a complete picture of the traffic generated by different sources. This information can be used to optimize your marketing strategy by focusing on the sources that generate the most traffic and minimizing efforts on sources that underperform. Furthermore, the data can be analyzed to identify trends and patterns that can inform future marketing decisions. Overall, the data presented in Table 1 is a valuable resource for anyone looking to improve their website's traffic and engagement metrics.

*Table 2: The Visit Statistics per Platform*
| Platform | # of pages visited | Conversion | Drop-out | Bounce | Total visits | Conversion rate | Drop-out rate | Bounce rate |
|----------|--------------------|------------|----------|--------|--------------|-----------------|---------------|-------------|
| android | 148686 | 6642 | 10003 | 8003 | 44500 | 0.15 | 0.22 | 0.18 |
| ios | 145639 | 5649 | 10969 | 8001 | 44500 | 0.13 | 0.25 | 0.18 |
| mac | 94268 | 4481 | 6296 | 4497 | 28000 | 0.16 | 0.22 | 0.16 |
| unknown | 48723 | 1976 | 3704 | 3341 | 15400 | 0.13 | 0.24 | 0.22 |
| windows | 94261 | 4592 | 6228 | 4608 | 28000 | 0.16 | 0.22 | 0.16 |

Observing **Table 2**, we can see the visit statistics filtered by platform. It's important to note that this information can provide us with valuable insights into user behaviour and preferences, which we can then use to inform future decision-making. For example, if we notice that a certain platform has significantly more visits than others, we may want to consider investing more resources into that platform to maximize our reach and engagement. Alternatively, if we notice that a certain platform has a high bounce rate, we may want to investigate why that is and make adjustments to improve the user experience. By taking a more nuanced approach to analyzing these visit statistics, we can gain a deeper understanding of our audience and optimize our strategies accordingly.

### Over graphs
I analyzed the traffic to the website and found significant differences in visits, conversion rates, and bounce rates among the three advertisement campaigns. LinkedIn had the highest conversion rate at 25%, followed by Partner Websites at 11% and Facebook at 1%.

![Conversion rates graph](src/assets/images/website_analytics_clickstream/4.webp)

The bounce rate for Facebook was 43%, while the other two campaigns had no such visitors. Interestingly, visitors from shared posts on social media and search engines generated more traffic than the advertisements. Direct traffic had the highest conversion rate at 32%, followed by search engine visitors at 15%, and shared posts on Facebook and LinkedIn at 13% and 12%, respectively.

![Traffic sources graph](src/assets/images/website_analytics_clickstream/5.webp)

Mobile visitors were much more numerous than desktop visitors, but desktop visitors had a slightly higher conversion rate and lower bounce rate. IOS platform visitors had a 25% drop-out rate, while other platforms had a 22% rate (except for unknown visitors at 24%). Visitors had difficulty navigating beyond the 'Blog 1' page, with a 10% bounce rate for desktop users and a 6% bounce rate for IOS and Android users. The 'Home' page had a 9% bounce rate for desktop users and a 6% bounce rate for IOS and Android users. Blog 1 was the most challenging page for visitors, but 24% of visitors who completed a successful purchase had read it. Blog 2 had a 19% success rate.

![Page performance graph](src/assets/images/website_analytics_clickstream/6.webp)

To increase conversion rates and reduce bounce rates, the company should invest more in LinkedIn advertisements and improve its search engine optimization. It should also improve the layout of 'Blog 1' and 'Home' pages, especially for Windows and Mac users. Additionally, it should write more blogs similar to the content of Blog 1 to contribute to higher conversion rates.

## Key takeaways:

- LinkedIn had the highest conversion rate at 25%.
- Mobile visitors were much more numerous than desktop visitors.
- Direct traffic had the highest conversion rate at 32%.
- Blog 1 was the most challenging page for visitors but was read by 24% of successful purchasers.
- The company should invest more in LinkedIn advertisements and improve search engine optimization to increase conversion rates and reduce bounce rates.