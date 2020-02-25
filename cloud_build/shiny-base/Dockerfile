FROM rocker/shiny:3.6.1

COPY ./requirements.txt ./requirements.txt

# ABOUT sed:
#     $(sed -n "/<apt>/,/<apt-end>/p" requirements.txt | tail +2 | head -n -1)
# sed will read out the contents of a file between a start and end value
# FORMAT:
#     /{starting tag}/,/{closing tag}/p {filename}
# then we use head and tail to cut off the first and last line of output
# this would have been the <apt> and <apt-end> lines

RUN apt-get update && \
    apt-get install -y $(sed -n "/<apt>/,/<apt-end>/p" requirements.txt | tail +2 | head -n -1)

RUN pip3 install $(sed -n "/<python>/,/<python-end>/p" requirements.txt | tail +2 | head -n -1)

RUN install2.r --error -r 'http://cran.rstudio.com' \
    $(sed -n "/<cran>/,/<cran-end>/p" requirements.txt | tail +2 | head -n -1)

# Clean up install2.r leftovers
RUN rm -rf /tmp/downloaded_packages/ /tmp/*.rds
