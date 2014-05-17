nor-upcloud
===========

Client module for Upcloud API

Install it
----------

```
npm install -g nor-upcloud
```

Example CLI usage
-----------------

Save your password to file `~/.nor-upcloud-cli.json` as:

```
{
  "upcloud": "username:passhprase"
}
```

Then you can:

* List servers: `nor-upcloud server-list`
* Start server: `nor-upcloud --hostname=foo.example.com server-start`
* Stop server: `nor-upcloud --hostname=foo.example.com server-stop`
* Get data for server: `nor-upcloud --hostname=foo.example.com server-info`

To select a server you can use any of these:

* `--hostname=NAME`
* `--uuid=UUID`
* `--title=TITLE`

You can switch the view type using:

* `--view=table` (default)
* `--view=json`
