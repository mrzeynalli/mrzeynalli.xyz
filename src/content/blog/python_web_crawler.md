---
author: Elvin Zeynalli
pubDatetime: 2023-10-01T18:33:53+03:00
title: "Building a Web Crawler using Python"
postSlug: building-python-web-crawler
featured: false
draft: false
tags:
  - Web Analytics
  - Web Crawling
  - Python
description: "A comprehensive guide to building a functional web crawler in exactly 100 lines of Python code, covering URL success handling, depth thresholds, and data storage."
---

In this article, I’m going to explain the concept of a web crawler, how search engines work, and guide you in building a simple Crawler bot. All the code I’ve written for this can be found on [my GitHub repository](https://github.com/mrzeynalli/web_crawler/tree/main), and feel free to use, modify, or replicate it for personal or commercial purposes without needing my consent.

---

**Project description**
* *Language:* Python
* *Libraries:* request, bs4, regex, os, json
* *IDE:* Microsoft Visual Studio Code
* *Project type:* Web crawling/scraping

![Photo by Timothy Dykes on Unsplash](/images/web_crawler/1.webp)
*Photo by Timothy Dykes on Unsplash*

As the name suggests, a web crawler is an application that explores the web like a spider, gathering the desired information. Well-known search engines like Google, Bing, and Yahoo have incredibly fast crawlers that navigate the internet in a matter of seconds (although they don’t crawl the entire web all the time, they minimize the number of web pages to consider using indexing). The good news is, you too can create your own web crawler using Python, and it only requires around 100 lines of code (actually, it’s exactly 100 lines!).

# Web Crawler

First, let’s break down the process into smaller steps to understand how to build the crawling bot (“First Principles”). The steps the bot needs to follow are as follows:

1. Access the webpage
2. Request its content (HTML source code)
3. Analyze the content and gather internal links
4. Extract text information from each link
5. Repeat until a pre-defined threshold is reached

To perform these steps, we need to install/import specific Python libraries. For the first two steps, we will use the **requests** library, which allows us to send a request to a webpage to get its content. Next, we will use the **bs4** library to help us understand the collected content and parse it for extracting the desired information, which in this case is the internal links and their text content. The bot will also follow these steps for the collected links. Now, let’s delve into the technical details of building the bot.

## WebCrawler Class
We need to create a class named “WebCrawler” and define its parameters:

```python
# build the web crawler object
class WebCrawler:

    # create three variables: start_url, max_depth, list of visited urls
    def __init__(self, start_url, max_depth=2):
        self.start_url = start_url
        self.max_depth = max_depth
        self.visited = set()
```
The class requires two input parameters: start_url and max_depth, along with an initial parameter visited.
* **start_url** — This is the main webpage we want to crawl (format: https://example.co.uk)/).
* **max_depth** — This indicates the depth of the crawling. Setting it to 1 will make our bot only follow the links collected from the starting URL. When set to 2, it will follow the links within those internal (from the initial URL) pages. The time complexity increases exponentially as the max_depth value increases.
* **visited** — This variable is a set that lists the URLs that have already been visited. It prevents the bot from revisiting the same link multiple times. Note that this variable is a set object rather than a list, which avoids adding duplicate entries (URLs).

## Checking URL Success
Inside the *WebCrawler* class, we need to create another function to ensure that our request to the starting page is successful. This can be determined by checking the status code of the HTML request. Please note that a status code of 200 indicates a successful request.

```python
# create a function to make sure that the primary url is valid
def is_successful(self):

    try:
        response = requests.get(self.start_url, timeout=20) # request the page info 
        response.raise_for_status() # raises exception when not a 2xx response
        if response.status_code == 200: # check if the status code is 200, a.k.a successful
            return True
        
        else: # if not, print the error with the status code
            print(f"The crawling could not being becasue of unsuccessful request with the status code of {response.status_code}.")

    except requests.HTTPError as e: # if HTTPS Error occured, print the error message
        print(f"HTTP Error occurred: {e}")

    except Exception as e: # if any other error occured, print the error message
        print(f"An error occurred: {e}")
```
With this debugging approach, the crawling process will only be executed if the request is successful. Otherwise, it will either return the status code of an unsuccessful request or an HTTP or other encountered error. The *timeout* parameter determines the amount of time, in seconds, that the request attempt should wait before raising an error. It is different from the *time.sleep(10)* function. In this case, if the request is successful, the information will be retrieved immediately. However, if an error occurs, it will wait for 10 seconds before concluding an error. This is an important parameter to set up as sometimes the server may take a few seconds to respond.

## Processing Pages
The next step is to create a function that will enter a webpage and gather the links present as well as the text.

```python
# create a function to get the links
def process_page(self, url, depth):

    # apply depth threshold
    if depth > self.max_depth or url in self.visited:
        return set(), '' # return empty set and string

    self.visited.add(url) # add the visited url to the set
    links = set() # create a set to store the collected links
    content = '' # create a variable to store the content extracted

    try:
        r = requests.get(url, timeout=10) # request the content of a url
        r.raise_for_status() # check if the request status is successful
        soup = BeautifulSoup(r.text, 'html.parser') # parse the content of the collected HTML
        
        # Extract the links
        anchors = soup.find_all('a') # find all the anchors

        for anchor in anchors: # merge the anchor with the starting url
            link = requests.compat.urljoin(url, anchor.get('href')) # get the link and join it with the starting url
            links.add(link) # add the link to the previously created set
        
        # Extract the content from the url
        content = ' '.join([par.text for par in soup.find_all('p')]) # get all the text
        content =  re.sub(r'[\n\r\t]', '', content) # remove the sequence characters

    except requests.RequestException: # if the request encounters an error, pass
        pass

    return links, content # return the set of the collected links and the contet of the current url
```
The function called *process_page* is inside the WebCrawler class and is responsible for collecting the link extensions found on a page, combining them with the primary URL, and extracting the text from each URL. Initially, it checks if the threshold (max depth, in this case) has been reached. If the depth is still below the predetermined limit, the crawling process continues. First, the bot adds the starting URL to the *visited* set and creates another set to collect the links found on that page. It is important to note that the links on a page do not follow a URL structure but are presented as link extensions (explained below). Therefore, it is crucial to merge them before appending them as final links.
* link or URL — it begins with an HTTPS code and contains the complete reference structure (examples: https://example.co.uk, https://example.co.uk/contact)
* link extension — this refers only to the extension of the primary URL, essentially the part of the URL that comes after the “/” character (examples: /home, /contact, /careers)

The function then utilizes the *BeautifulSoup* object from the **bs4** library to parse the HTML source code of the webpage and scrape the page content. This content includes everything present on the page in text format, including the URL extensions. The bot searches for anchor elements within the soup by looking for ‘a’ tags, which contain the hyperlinks to other pages. After collecting the anchors, it iterates through each one to search for the *‘href’* tag, which contains the actual links. The compat.urljoin method from the request library is used to join the link with the URL and add the final URL to the set of links. Next, it looks for the *‘p’* tags, which contain plain text units, and joins them together within a particular page, storing the content in the content variable. To remove any escape sequences such as “/n”, “/r”, and “/t” (representing new line, return, and tab characters) and retain only the plain text, the sub method from the **regex** module (imported as **re**) is used to replace these sequences with an empty string. Finally, this process is debugged to handle any potential errors with internal links, in addition to the starting URL. Ultimately, this function returns the collected links and the text content of the requested URL.

## Crawling the Webpage
The scraping function has been implemented, and now it’s time to build the crawling function. This function applies the scraping process to each of the links collected from a URL. Here is the code for this function:

```python
# crawl the web within the depth determined
def crawl(self):
    
    if self.is_successful(): # check if the requesting the starting url info is valid to continue crawling
        
        urls_content = {} # create a dictionary to store the links as keys and contents as values
        urls_to_crawl = {self.start_url} # start crawling from the initial url

        # crawl the web within the depth determined
        for depth in range(self.max_depth + 1):

            new_urls = set() # create a set to store the internal new urls

            for url in urls_to_crawl:  # crawl through the urls

                if url not in self.visited: # check and make sure that the url is not crawled before
                    links, content = self.process_page(url, depth) # return the links and content of the crawled url
                    urls_content[url] = content # add the url as a key and content as a value to the disctionary created previously
                    new_urls.update(links) # add the internal links to the previously created set

            urls_to_crawl = new_urls # change the urls to crawl list to crawl through the internal links

        # create a folder to store the crawled websites
        current_dir = os.getcwd() # get the current working directory
        folder_dir = os.path.join(current_dir,'crawled_websites') # create a folder inside the current directory

        if not os.isdir(folder_dir): # check if the folder already exists
            os.makedirs(folder_dir) # if not, create the folder directory

        filename = re.sub(r'\W+', '_', self.start_url) + '_crawling_results.json' # format the filename to modify unsupported characters
        
        # save the results as a json file in the local directory
        with open(os.path.join(folder_dir,filename), 'w', encoding='utf-8') as file:
            json.dump(urls_content, file, ensure_ascii=False, indent=10) # ensure to keep the unicode characters and indent to make it more readable

        return urls_content # return the disctionary storing all urls and their content
```

The crawling process begins by checking the URL’s validity using the previously created function. If the check is successful, the function creates a dictionary to store the links along with their respective text content. It then iterates through the range of the maximum depth set in the object. For each depth, it creates a set to store the collected links to be iterated through subsequently. After confirming that the URL has not been visited before, it enters the current URL and uses the *process_page* function to extract all the internal links and text content. The new_urls set is then updated with the collected links, and each content is added to the dictionary with the internal link as the key. Once the crawling of a URL is complete, the newly collected URLs replace the *urls_to_crawl*, and the same steps are repeated for each of them.

Before returning the dictionary with lists as keys and content as values, the function also saves the information as a JSON file in a folder created in the current working directory. To accomplish this, the **JSON** and **OS** modules of Python are used. The folder name is defined and joined with the current directory using *os.path.join*. The function checks if the folder already exists with *os.isdir(foldername)*. If it doesn’t exist, the function creates the folder and dumps the dictionary information into a JSON file within the created folder.

# Can I crawl the entire web?
![Photo by Timothy Dykes on Unsplash](/images/web_crawler/2.webp)
*Photo by Timothy Dykes on Unsplash*

While it is technically possible to crawl a large portion of the clear web (unlike the dark web), it’s important to be aware of legal and ethical considerations. Some websites have specific permissions regarding web crawling, and not adhering to these permissions can lead to legal and ethical issues. Therefore, it’s always best practice to ensure proper authorization before proceeding with web crawling activities. You can usually find the necessary authorization information in the website’s “robots.txt” file. Take a moment to review this file and follow its guidelines.

It’s worth noting that the speed at which giant search engines like Google and Bing crawl the web is quite impressive and difficult to replicate. These search engines employ a vast amount of computational power and infrastructure to crawl and index web pages efficiently. They have dedicated teams of engineers and data centers around the world to support their crawling operations. Creating web crawlers that match the speed and efficiency of these search engines requires is practically impossible for an individual with a laptop in his/her basement as it requires substantial resources, including powerful servers, advanced algorithms, and a team of experts.