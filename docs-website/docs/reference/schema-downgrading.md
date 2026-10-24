---
title: Schema downgrading
description: Why DbBump does not roll a database back to an earlier version, and what to do instead.
---

# Schema downgrading

DbBump does not downgrade a database to an earlier version. Downgrade scripts are hard to get right
and are rarely tested, so they tend to fail when you need them most. See the
[original discussion](https://github.com/DbUp/DbUp/issues/42).

To undo a change, write a new script that moves the database forward to the state you want. That
script is tested and journaled like any other.

If you need downgrades anyway, look at the community project
[DbUp.Downgrade](https://github.com/asimeonov/DbUp.Downgrade). It is built for upstream DbUp.
