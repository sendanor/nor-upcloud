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

To select a server you can use any of these:

* `--username`
* `--uuid`
* `--title`

You can switch the view by:

* `--view=json`
* `--view=table` (default)
