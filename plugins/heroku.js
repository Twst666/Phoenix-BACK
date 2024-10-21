const Heroku = require("heroku-client");
const {
  version
} = require("../package.json");
const {
  pnix,
  isPrivate,
  tiny
} = require("../lib/");
const Config = require("../config");
const heroku = new Heroku({
  'token': Config.HEROKU_API_KEY
});
const baseURI = "/apps/" + Config.HEROKU_APP_NAME;
const simpleGit = require("simple-git");
const git = simpleGit();

pnix({
  'pattern': "restart",
  'fromMe': true,
  'type': "heroku"
}, async _0x1e4b07 => {
  await _0x1e4b07.reply("_🔄 Restarting_");
  await heroku["delete"](baseURI + "/dynos")["catch"](async _0x3ca527 => {
    await _0x1e4b07.reply("*HEROKU : " + _0x3ca527.body.message + '*');
  });
});

pnix({
  'pattern': "shutdown",
  'fromMe': true,
  'type': "heroku"
}, async _0x539f15 => {
  await heroku.get(baseURI + "/formation").then(async _0x58e5fe => {
    await _0x539f15.reply("_Shutting Down Phoenix-MD_");
    await heroku.patch(baseURI + '/formation/' + _0x58e5fe[0x0].id, {
      'body': {
        'quantity': 0x0
      }
    });
  })["catch"](async _0x5a3bbe => {
    await _0x539f15.reply("HEROKU : " + _0x5a3bbe.body.message);
  });
});

pnix({
  'pattern': "setvar",
  'fromMe': true,
  'type': "heroku"
}, async (_0x56cb3b, _0x1cb5de) => {
  if (!_0x1cb5de) {
    return await _0x56cb3b.reply("*📌 Example:* .setvar SUDO:919074692450");
  }
  const _0x343a6c = _0x1cb5de.slice(0x0, _0x1cb5de.indexOf(':')).trim();
  const _0x49139c = _0x1cb5de.slice(_0x1cb5de.indexOf(':') + 0x1).trim();
  if (!_0x343a6c || !_0x49139c) {
    return await _0x56cb3b.reply("*📌 Example:* .setvar SUDO:919074692450");
  }
  heroku.patch(baseURI + "/config-vars", {
    'body': {
      [_0x343a6c.toUpperCase()]: _0x49139c
    }
  }).then(async () => {
    await _0x56cb3b.reply(_0x343a6c.toUpperCase() + ": " + _0x49139c);
  })["catch"](async _0x5b0e4b => {
    await _0x56cb3b.reply("HEROKU: " + _0x5b0e4b.body.message);
  });
});

pnix({
  'pattern': "delvar",
  'fromMe': true,
  'type': "heroku"
}, async (_0x4b7c6f, _0x19f13c) => {
  if (!_0x19f13c) {
    return await _0x4b7c6f.reply("*📌 Example:* delvar sudo");
  }
  heroku.get(baseURI + "/config-vars").then(async _0x1d6515 => {
    const _0x4d0e57 = _0x19f13c.trim().toUpperCase();
    if (_0x1d6515[_0x4d0e57]) {
      await heroku.patch(baseURI + "/config-vars", {
        'body': {
          [_0x4d0e57]: null
        }
      });
      return await _0x4b7c6f.reply("_Deleted " + _0x4d0e57 + '_');
    }
    await _0x4b7c6f.reply('_' + _0x4d0e57 + " Not Found_");
  })["catch"](async _0x2c6eb9 => {
    await _0x4b7c6f.reply("*HEROKU : " + _0x2c6eb9.body.message + '*');
  });
});

pnix({
  'pattern': "allvar",
  'fromMe': true,
  'type': "heroku"
}, async _0x324187 => {
  let _0x3f1561 = "Here Are All the Heroku Vars\n\n\n";
  try {
    const _0x2f90a0 = await heroku.get(baseURI + "/config-vars");
    for (const _0x4ba1fc in _0x2f90a0) {
      _0x3f1561 += _0x4ba1fc + " : " + _0x2f90a0[_0x4ba1fc] + "\n\n";
    }
    await _0x324187.reply(_0x3f1561 + '');
  } catch (_0x39bf65) {
    await _0x324187.reply("HEROKU : " + _0x39bf65.message);
  }
});
