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
docker run -it alpine:3.10

alpine is the smallest possible linux, its weight is about 20mb











