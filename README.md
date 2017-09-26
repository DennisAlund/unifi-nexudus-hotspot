# unifi-nexudus-hotspot
UniFi - Custom portal that integrates with Nexudus Spaces and membership status aware.

This project is an implementation of a external guest portal for Unifi managed networks. The purpose of having an external portal is that you can plug in your own authentication and user database to control access to your network ([read about the concept here](https://help.ubnt.com/hc/en-us/articles/204950374-UniFi-Custom-Portal-With-Individual-Usernames-and-Passwords-)).

This particular example is using [Nexudus Spaces](http://coworking.nexudus.com/) to check for active membership status in a coworking space, as a requirement for being allowed onto the wifi network.

Apart from the project's own purpose, it is also an example of  how easy it is to adopt an existing Express application to run on Firebase hosting/cloud functions. Apart from the configuration setup, there is no code awareness whether the app is made for running on Firebase or in a Docker container. You can choose whichever works best for you.

# Using Firebase [![Travis Build Status](https://img.shields.io/travis/DennisAlund/unifi-nexudus-hotspot.svg)](https://travis-ci.org/DennisAlund/unifi-nexudus-hotspot/builds)

The are a few good benefits of running the Unifi External guest portal on Firebase: CDN, managed SSL certificate and high reliability and it's very easy to set up for automatic configuration and deployment for each new revision of the application. But it requires a roundtrip to an external site, outside of your LAN, in order to log a device in on the guest portal. 

This most definitely is an extra configuration step of your Unifi controller. But it is also possible that it takes slightly longer time for the hotspot login page to display. You might also want to think what kind of fallback behavior you want if the WAN connection is cut. With a Firebase hosting it would mean that your hotspot login will also break when there's no Internet connection. Do you need your LAN to work whilst WAN is offline?

## Configure Unifi Controller
Under **Settings** &rarr; **Guest Control** set the following values:

* **Custom Portal**: `151.101.1.195` or `151.101.65.195`
* **Redirection**
    - **Use secure portal**: Check this box
    - **Redirect using hostname**: `<your-project-id>.firebaseapp.com`

## Deploying to Firebase
You'll have to clone and configure your .firebaserc or just set the project

```bash
firebase use <your-project-id>
firebase deploy
```

### Configuring Environment variables
These are the environment variables that are avaialable to be set in the application. Some of the variables has a reasonable default value if omitted when running the image. The others, which are recommended or required are described below.

* `nexudus.shortname` (**required**) - The [Nexudus space](http://coworking.nexudus.com/) short name for your business, e.g. `nexudus` as in http://nexudus.spaces.nexudus.com/.
* `unifi.host` (**required**) - IP or hostname of the UniFi controller portal, e.g. `unifi.example.com`
* `unifi.password` (**required**) - Password for the API calls to be authorized with the UniFi controller.
* `unifi.redirect_url` - URL to redirect the connecting device if none was found in the hotspot connection request *(default: [`https://www.kumpul.co`](https://www.kumpul.co))*
* `unifi.port` - The port on which the UniFi controller is responding to REST/HTTP requests. If you don't know which one it is, you can most likely just omit it and use default *(default: `8443`)*
* `unifi.username` - Username for the API calls to be authorized with the UniFi controller. It's recommended that you create a dedicated admin user for API calls like this one *(default: `admin`)*

# Using Docker [![Dockherhub Build Status](https://img.shields.io/docker/build/kumpul/unifi-nexudus-hotspot.svg)](https://hub.docker.com/r/kumpul/unifi-nexudus-hotspot/builds/) [![Dockherhub Build Type](https://img.shields.io/docker/automated/kumpul/unifi-nexudus-hotspot.svg)](https://hub.docker.com/r/kumpul/unifi-nexudus-hotspot/builds/)

This might be your preferred choice if you rather prefer to run the portal on your own server in the cloud or locally, on the same server as you are running your Unifi Controller. It's very easy to build or fetch from the [docker hub repository](https://hub.docker.com/r/kumpul/unifi-nexudus-hotspot/).

## Pull the image
Pull your [preferred version from the docker hub repository](https://hub.docker.com/r/kumpul/unifi-nexudus-hotspot/tags/)

```bash
docker pull kumpul/unifi-nexudus-hotspot:latest
```


## Build it yourself

```bash
docker build --rm -t kumpul/unifi-nexudus-hotspot .
```

## Running a container
All examples for local execution are using Linux as reference. Should be the same for OSX users, but Windows users might want to double check the syntax.

```bash
 docker run --rm -p 8080:80\
    -e NEXUDUS_SPACE_NAME=kumpul\
    -e UNIFI_ADMIN_USER=myAdminUser\
    -e UNIFI_ADMIN_PASSWORD=secretPasssword\
    -e UNIFI_HOST=10.11.12.13\
    kumpul/unifi-nexudus-hotspot
```

To run the image in debug mode, just add `debug` after the name of the image.

```bash
 docker run kumpul/unifi-nexudus-hotspot debug
 ```

### Environment variables
These are the environment variables that are avaialable to be set in the application. Some of the variables has a reasonable default value if omitted when running the image. The others, which are recommended or required are described below.

* `NEXUDUS_SPACE_NAME` (**required**) - The [Nexudus space](http://coworking.nexudus.com/) short name for your business, e.g. `nexudus` as in http://nexudus.spaces.nexudus.com/.
* `UNIFI_ADMIN_PASSWORD` (**required**) - Password for the API calls to be authorized with the UniFi controller.
* `UNIFI_ADMIN_USER` - Username for the API calls to be authorized with the UniFi controller. It's recommended that you create a dedicated admin user for API calls like this one *(default: `admin`)*
* `UNIFI_USE_SSL` - Whether your UniFi controller portal is setup to use SSL *(default: `true`)*
* `UNIFI_SSL_SELF_SIGNED` - Whether your SSL certificate for the UniFi portal is self signed *(default: `false`)*
* `UNIFI_HOST` - IP or hostname of the UniFi controller portal, e.g. `unifi.example.com` *(default: `127.0.0.1`)*
* `UNIFI_PORT` - The port on which the UniFi controller is responding to REST/HTTP requests. If you don't know which one it is, you can most likely just omit it and use default *(default: `8443`)*
* `DEFAULT_REDIRECT_URL` - URL to redirect the connecting device if none was found in the hotspot connection request *(default: [`https://www.kumpul.co`](https://www.kumpul.co))*
* `PORT` - The port on which to serve the application on *(default: `80`)*
