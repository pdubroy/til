# Backups with Borg and borgmatic

I recently set up an old Mac Mini with Debian, mainly to use as a file server for my family. I decided to set up off-site backups to a [Hetzner Storage Box](https://www.hetzner.com/storage/storage-box/).

If you do a bit of research, you'll find a lot of recommendations for [Borg](https://www.borgbackup.org/) and [Restic](https://restic.net/). Ultimately they're pretty similar — they're both open source, deduplicating backup tools that support compression and encryption at rest. I decided to go with Borg.

## borgmatic

On its own, Borg is pretty flexible, but relatively complex to configure. borgmatic is a Python-based wrapper script around Borg that's supposed to be easier to use.

The stuff I wanted to back up is in my home directory, so I followed the instructions for a non-root install:

```
sudo apt install pipx
pipx ensurepath
pipx install borgmatic
```

(I could have used the Debian-packaged version, but I'm running Debian stable, which has a [relatively old version of borgmatic](https://packages.debian.org/bookworm/borgmatic).)

I set up the following config in ~/.config/borgmatic/config.yaml (sensitive stuff redacted of course):

```yaml
source_directories:
    - /home/pdubroy/██████
    - /home/pdubroy/█████
    - /home/pdubroy/███████

encryption_passphrase: "██████████████████"
repositories:
    - path: ssh://u██████-sub2@u██████.your-storagebox.de:23/./pats-server.borg
      label: storagebox
      encryption: repokey-blake2
      # append_only: true

# List of checks to run to validate your backups.
checks:
    - name: repository
    - name: archives
      frequency: 2 weeks

keep_daily: 7
keep_weekly: 4
keep_monthly: 6
```

Some notes:

- I'm using a sub-account to connect to the Storage Box with key-based authentication. It's possible to restrict the key to using borg only in append-only mode, as described in [How I Use Borg for Ransomware-Resilient Backups](https://artemis.sh/2022/06/22/how-i-use-borg.html) — but I haven't done that yet.
- I considered other ways of storing the passphrase, but anyone who can read the file also has access to all my data, so I went for the simple approach.

I run the actual backups via a cron job on my user account. I ran `crontab -e` and created the following entry:

```cron
0 3 * * * /home/pdubroy/.local/bin/borgmatic --verbosity 1 --log-file ~/logs/borgmatic/daily.log
```
