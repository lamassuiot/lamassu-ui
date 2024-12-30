FROM node:18

RUN apt-get update
RUN apt-get install -y zsh

ENV NODE_OPTIONS="--max-old-space-size=16384 --openssl-legacy-provider"

RUN wget https://github.com/ohmyzsh/ohmyzsh/raw/master/tools/install.sh -O - | zsh || true

CMD ["zsh"]
