let fs = require("fs");
let rp = require("request-promise");
let request = require("request");
let path = require("path");
let db = require("./mysql.js");
let tool = require("./tool.js");
let oauth = require("./oauth.js");
let log = require('tracer').colorConsole();
let async = require("async");

module.exports = {
    fs,
    rp,
    request,
    path,
    db,
    tool,
    oauth,
    log,
    async,
};
