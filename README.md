# unifi-nexudus-hotspot
[![Dockherhub Build Status](https://img.shields.io/docker/build/kumpul/unifi-nexudus-hotspot.svg)](https://hub.docker.com/r/kumpul/unifi-nexudus-hotspot/builds/)
[![Dockherhub Build Type](https://img.shields.io/docker/automated/kumpul/unifi-nexudus-hotspot.svg)](https://hub.docker.com/r/kumpul/unifi-nexudus-hotspot/builds/)


UniFi - Custom portal that integrates with Nexudus Spaces and membership status aware

# Build the image

```bash
docker build --rm -t kumpul/unifi-nexudus-hotspot .
```

# Running a container
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

## Environment variables
These are the environment variables that are avaialable to be set in the application. Some of the variables has a reasonable default value if omitted when running the image. The others, which are recommended or required are described below.

* `DEFAULT_REDIRECT_URL` - URL to redirect the connecting device if none was found in the hotspot connection request *(default: [`https://www.kumpul.co`](https://www.kumpul.co))*
* `NEXUDUS_SPACE_NAME` (**required**) - The [Nexudus space](http://coworking.nexudus.com/) short name for your business, e.g. `nexudus` as in http://nexudus.spaces.nexudus.com/.
* `UNIFI_SITE_NAME` - The short name of your UniFi site, as referred to by the controller. If you don't know what it is, and expecially if you only have one site configured, then it's most likely `default` and you don't need to worry about it *(default: `default`)*
* `UNIFI_USE_SSL` - Whether your UniFi controller portal is setup to use SSL *(default: `true`)*
* `UNIFI_SSL_SELF_SIGNED` - Whether your SSL certificate for the UniFi portal is self signed *(default: `false`)*
* `UNIFI_HOST` - IP or hostname of the UniFi controller portal, e.g. `unifi.example.com` *(default: `127.0.0.1`)*
* `UNIFI_PORT` - The port on which the UniFi controller is responding to REST/HTTP requests. If you don't know which one it is, you can most likely just omit it and use default *(default: `8443`)*
* `UNIFI_ADMIN_USER` - Username for the API calls to be authorized with the UniFi controller. It's recommended that you create a dedicated admin user for API calls like this one *(default: `admin`)*
* `UNIFI_ADMIN_PASSWORD` (**required**) - Password for the API calls to be authorized with the UniFi controller.
* `PORT` - The port on which to serve the application on *(default: `80`)*

The following environment variables are **absolutely required to be set**, they don't have any default values that makes any sense:

 * `NEXUDUS_SPACE_NAME`
 * `UNIFI_ADMIN_PASSWORD`
