# Gmail backups with imapsync

I recently realized that I had ~18 years of email stored in Gmail, with no backup. This week I fixed that, using imapsync to backup up the entire contents of my Gmail (~10GB) to [mailbox.org](https://mailbox.org/).

The imapsync documentation is great, but it took me a few tries to find all the right flags for my use case. Here's what I ended up with:

```
#!/usr/bin/env bash
imapsync \
  --user1     xyz@gmail.com \
  --password1 "${GMAIL_APP_PASSWORD}" \
  --host2     imap.mailbox.org \
  --user2     abc@mailbox.org \
  --password2 "${MAILBOX_ORG_PASSWORD}" \
  --gmail1 \
  --folderfirst ohm \
  --folderfirst GitHub \
  --exclude "^\[Gmail\]/Important$" \
  --exclude "^\[Gmail\]/Spam$" \
  --exclude "^\[Gmail\]/Starred$" \
  --exclude "^\[Gmail\]/Trash$" \
  --f1f2 "[Gmail]/Spam"="Spam" \
  --f1f2 "[Gmail]/All Mail"="Archive" \
  --delete2folders \
  --delete2foldersbutnot "/\d{4}/" \
  --nofoldersizes \
  --nofoldersizesatend \
  "$@"
```

A quick explanation:
- `--folderfirst`: Gmail's _labels_ are exposed as IMAP folders, which means that the same email might appear in multiple folders. By using `--folderfirst`, imapsync will sync emails with that label to a folder of the same name, and all other labels will be dropped.
- I don't use `Important` or `Starred` in Gmail, so I didn't sync those. `Spam` and `Trash` I didn't care about syncing.
- `--delete2folders` removes any folders on the dest that don't appear in Gmail, and `--delete2foldersbutnot` lets you specify a regex for folders that _shouldn't_ be deleted.
- The `$@` means that any arguments to the script will be passed in to imapsync. So I can call my script like this: `bin/gmail-sync.sh --dry` and it will pass the `--dry` arg to imapsync.
