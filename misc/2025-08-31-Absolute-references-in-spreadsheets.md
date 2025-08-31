# Absolute references in spreadsheets

I've never been a serious spreadsheet user, but still, I'm kind of shocked that I *didn't* learn this earlier.

When you write a cell formula that references another cell, like `=A6*2`, it's a _relative_ reference. Say you used that formula in the cell B6. If you copy and paste into B7 — one cell below the original one — it will be rewritten to `=A7*2`. (This I knew.)

To make an _absolute_ reference, you could instead write `$A$6`. This way, the cell reference will never be automatically updated. You can also make a _mixed_ reference with `$A6` or `A$6`.
