FROM rocker/shiny:3.6.1

RUN apt-get update && \
    apt-get install -y libav-tools curl ffmpeg \
    build-essential pkg-config r-base-dev libxml2-dev libssl-dev libcurl4-openssl-dev \
    python3-pip python3-dev

RUN pip3 install tensorflow tensorflow-hub pillow matplotlib

# RUN Rscript -e "install.packages('shinyWidgets')"

RUN install2.r --error -r 'http://cran.rstudio.com' shinyWidgets

RUN install2.r --error -r 'http://cran.rstudio.com' tensorflow

RUN install2.r --error -r 'http://cran.rstudio.com' bigrquery

RUN install2.r --error -r 'http://cran.rstudio.com' readr

RUN install2.r --error -r 'http://cran.rstudio.com' ggplot2

RUN install2.r --error -r 'http://cran.rstudio.com' kableExtra

RUN install2.r --error -r 'http://cran.rstudio.com' dplyr

RUN install2.r --error -r 'http://cran.rstudio.com' data.table

RUN install2.r --error -r 'http://cran.rstudio.com' tibble

RUN install2.r --error -r 'http://cran.rstudio.com' randomForest

RUN install2.r --error -r 'http://cran.rstudio.com' knitr

RUN install2.r --error -r 'http://cran.rstudio.com' rmarkdown

RUN install2.r --error -r 'http://cran.rstudio.com' flexdashboard

RUN install2.r --error -r 'http://cran.rstudio.com' lattice

RUN install2.r --error -r 'http://cran.rstudio.com' plotly

# Clean up install2.r leftovers
RUN rm -rf /tmp/downloaded_packages/ /tmp/*.rds


## copy key, in future move to reference gcs bucket
##COPY ../../springer-nature-analytics-c1ef5688921c.json /srv/shiny-server/##booksapp/springer-nature-analytics-c1ef5688921c.json  

# assume shiny app is in build folder /shiny
COPY ./booksapp_dev/ /srv/shiny-server/booksapp_dev/