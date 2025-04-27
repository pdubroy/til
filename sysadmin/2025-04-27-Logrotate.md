# logrotate

I recently set up a Debian on an old Mac Mini, and it's been about 20 years since I actively ran a Linux server, so I'm relearning some things. :-D

This week, it's `logrotate`:

> **logrotate** is designed to ease administration of systems that generate large numbers of log files. It allows automatic rotation, compression, removal, and mailing of log files. Each log file may be handled daily, weekly, monthly, or when it grows too large.

In my last TIL, I wrote about [my daily backups with borgmatic](./2025-04-20-Backups-with-borg-and-borgmatic.md). That runs as a user (non-root) cron job, and logs to ~/logs/borgmatic/daily.log. I wanted those logs to be handled just like logs for system services; turns out that's pretty easy with `logrotate`.

I added the following config in ~/.logrotate.d/borgmatic:

```
/home/pdubroy/logs/borgmatic/daily.log {
    rotate 14
    weekly
    missingok
    notifempty
    create 640 pdubroy pdubroy
}
```

Notes:
- `rotate 14` means "keep 14 rotated log files before deleting the oldest ones"
- `weekly` -> Rotate the log file once per week
- `missingok` -> Don't throw an error if the log file is missing
- `notifempty` -> Don't rotate the log file if it's empty
- `create 640 pdubroy pdubroy` -> Permissions and owner/group for new files

Then I run logrotate daily with another cron job:

```
30 2 * * * /sbin/logrotate --state $HOME/.logrotate.state ~/.logrotate.d/borgmatic
```

There may be better setups but this is working for me so far!
