FROM node:16

RUN apt-get update

RUN apt-get install -y zsh

RUN yarn global add eslint

RUN wget https://github.com/ohmyzsh/ohmyzsh/raw/master/tools/install.sh -O - | zsh || true

CMD ["zsh"]
