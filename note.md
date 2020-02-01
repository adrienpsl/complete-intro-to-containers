# What are container ?

15 years ago, if I want to host a website,
I need to build server and hoist my site on a machine that is build for !
the guy talk about why container are good, and secure.


## chroot - cha-root // change root.

* I create a new env for my container inside my container,
  - I create a new directory
  - mkdir lib bin data
  - cp bin/* bin/* # I get all the binary I need
  - cp lib/ ./lib all the lib for the binary that give me the command
    ldd [ binary ]
  - chroot director bash
that will start a new system that can't access other file in the system
its start is . == /
so, I can create on my system a really protected environmet for all the stuff.

## Namespace
But, all the process are still accessible by all the process
```bash
# exit # from our chroot'd environment if you're still running it, if not skip this

# install debootstrap
apt-get update -y
apt-get install debootstrap -y
debootstrap --variant=minbase bionic /better-root

# head into the new namespace'd, chroot'd environment
unshare --mount --uts --ipc --net --pid --fork --user --map-root-user chroot /better-root bash # this also chroot's for us
mount -t proc none /proc # process namespace
mount -t sysfs none /sys # filesystem
mount -t tmpfs none /tmp # filesystem
apt-get install debootstrap -y
debootstrap --variant=minbase bionic /better-root
# minbase == min amount of tools needed
chroot . bash
```
I unshare all dangerous stuff, and create new inside my namespace.

## Cgroup
It's stuff create at google, that let process only have limited resource 
like Ram and Cpu.

## Introduction Conclusion
Docker is build on top of 3 linux stuff, 
1. `chroot` : create new `/` that block the process to go back in the fileSys
2. `NameSpace` : isolate the process to the command like pid or kill to ensure 
    it can't interact with the other computer stuff.
3. `cgroup` : allow limited resource to the process (ram, cpu...)

# Docker
like with npm, look at dockerHub if there is a container
that do what I want.
docker ps -> show all container

I can create system image (without copy all the lib and stuff) from a current
container, then after mount it on my system, but I still have to create cgroup
and Namespace. Docker img are like at the start of the course when we recreate
the same system with /bin/* and the lib. Docker mounts then automatically

* run container: 
docker run --interactive --tty alpine:3.10 

or, to be shorter: 
`docker run -it [--name 'name'] alpine:3.10`

alpine is the smallest possible linux, its weight is about 20mb
__that command will do all we spend One hour to do! OMG__

* one main id about container, is their ephemeral. They do not last very long.
  if it's not in the docker file, like running a database, when I close docker
  all the data goes away. (like with vincent, challenge armee).
  - so if I run without -it, docker just run and quit.
  - I can give command `docker -it alpine:3.10 ls` 

* `sudo docker -it --detach ubuntu:bionic`
   run the container in the background
   `sudo docker attach [name]`
   focus on the container

* if I name a container, kill it and create a new, I can't because docker keep
  trace of all that inside his log.
  so `docker rm 'name'` and `docker -it --name 'name' alpine:3.10`
  with `docker -it --name 'name' -rm alpine:3.10` I will delete after.

## Nodejs on Docker
* `docker -it node:12-stretch` stretch is the debian version 
   - that command drop me on a running nodeJs env
   - if I want launch debian: `docker -it node:12-stretch bash`

## Pay attention to the tag
the tag are very important, and you need to read it like the version with npm
always use the last lts, to get support.

## Docker cli
## Command
`docker run [container]` start the container
`docker exec [container name] [command]` exec inside the container
`docker log [container name]` ...


# DockerFiles
Dockers read that file and uses it to build the container.
`-t is tag sugar`
`--init` : leave Docker handle the sign term
` docker run --init --rm [name] `
`--publish 3000:3000` expose container on the port 3000 / localhost

Docker creates the first user in root if I did not specify 
something with the keyword USER.

if I add 
`EXPOSE [PORT]`, I need to add the -P when I start 
my container.

docker like makefile keep tracks of files, so 
if the order of the command is really important
```dockerfile
FROM node:12-stretch

USER node

RUN mkdir /home/node/code

WORKDIR /home/node/code

that will be cache, and restart only if I change 
package.json
COPY --chown=node:node package.json .
RUN npm i

COPY --chown=node:node . .

CMD ["node", "index.js"]
```

## there is a docker ignore.
it's work like .gitignore

# Alpine linux
the more little possible linux distribution,
Alpine base layers is 5mb, but it's force to install important stuff like
certificats...It's good, because with debian, that use python, hacker can 
put some python file inside my server, with alpine, no python interpreter,
no pb! It's secure by having less stuff!
Pay attention because alpine does not have bash
it use ash.

next: simplified source code of the node container
```dockerfile
FROM alpine:3.10

# Apk is Alpine package manager
RUN apk add --update nodejs npm

# create and add the node group
RUN addgroup -S node && adduser -S node -G node

USER node

RUN mkdir /home/node/code
WORKDIR /home/node/code
COPY --chown=node:node package.json ./
RUN npm install

COPY --chown=node:node ./ ./

CMD ["node", "index.js"]
```

## Multistage Build
I can build a container inside a container, or even between 
different files. In the next one, I well build (dev) install inside 
the first part with npm, and after that run inside (prod);
In the second part, I create my own image, to save max space.

look 3-alpine-linux file.

## Static Assets exercise
the exercise is very easy, just one container to build,
and after that other to run.

# Bind Mounts
That for keep data when the container is destroy but that not a snowflakes :
a snowflakes is a server that I set manually with ssh and if it's crash,
all the variable are lost, and I need to redo all the work. The idea is to build
cow, a cow is like all the other cow.
The other problem is the db, I don't want to lose my db if I destroy my container.
So we will use different way to mount stuff, keep.

So we use bind Mount to create a portal between a directory and my container,
each time I change the code on that directory, it's will be update on the 
container! Like if I want to write Go, and I do not want install go,
I install it inside a container, and bind the working dir, and compile between
them!

the next command will bind the ./build directory to the server nginx. That so cool!
```bash
docker run --mount type=bind,source="$(pwd)"/build,target=/usr/share/nginx/html -p 8080:80 nginx
```

## Volumes
Volumes will be handle by dockers, that not a directory inside my computer.
Docker will keep and do stuff with it. It's super with DB, cool, I set up
one time, and that's it! Different containers can read on the same volume,
like for the log.

```bash
docker run --env DATA_PATH=/data/num.txt --mount type=volume,src=incrementor-data,target=/data incrementor
```
--env DATA_PATH=/data/num.txt : give to my server the right path
--mount : src='the name of the volume' target='its path'
```bash
docker volume list
```

I also have a temporary file system (tmpfs), where I can put password, apiKey

## Container and dev environment
```docker run --rm -it --mount type=bind,source=(pwd),target=/src -p 1313:1313 -u hugo jguyomard/hugo-builder:0.55 hugo server -w --bind=0.0.0.0```
look how do that with jetbrain, because there is certainly a way to do that better.

## Networks & Docker: Mongodb
`docker network ls` : show all the docker networks
I can connect 2 containers to let them talk to each other.

```bash
# create the network
docker network create --driver=bridge app-net
# create a mongo db server that is connect to this bridge
# that container contains drivers
docker run -d --network=app-net -p 27017:27017 --name=db --rm mongo:3
# this one, will run mongod database
docker run -it --network=app-net --rm mongo:3 mongo --host db

# A node container with the node and mongodb dependency: app-with-mongod
docker run -p 3000:3000 --network=app-net --env MONGO_CONNECTION_STRING=mongodb://db:27017\
    app-with-mongo
 
```
This is very painful, so we will use docker compose.

# Docker compose
Docker-compose is really used in dev, but less in production
because, it connects only container on the same host.
To put that in prod, we will use kubernet.

# Kubernetes
Kubernetes is hard and need to be use only for production.
Basically Kubernetes is for handle 100 different containers
in production. 

















