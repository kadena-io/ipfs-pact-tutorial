FROM ubuntu:18.04
WORKDIR /pactfiles

# Run updates, install basics and cleanup
# - build-essential: Compile specific dependencies
# - git-core: Checkout git repos
RUN apt-get update -qq \
    && apt-get install -y --no-install-recommends build-essential git-core openssl libssl-dev libffi6 libffi-dev curl vim\
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

RUN apt-get update -qq \
    && apt-get install -y --no-install-recommends wget

RUN wget http://kadena.io/pact/builds/2.6.1/ubuntu-1204/pact-2.6.1-linux.zip

RUN apt-get update && apt-get install -y --no-install-recommends \
                bzip2 \
                unzip \
                xz-utils \
        && rm -rf /var/lib/apt/lists/*

RUN unzip pact-2.6.1-linux.zip && chmod +x pact

RUN apt-get update -qq \
    && apt-get install z3

#RUN wget --no-check-certificate https://raw.githubusercontent.com/kadena-io/pact/master/config.yaml
COPY config.yaml .

ENV PATH "$PATH:/pactfiles"

RUN mkdir -p log
RUN mkdir -p code
RUN mkdir -p yamls

ADD . /pactfiles

CMD [ "pact", "-s", "config.yaml" ]