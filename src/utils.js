const dfnsFormat = require("date-fns/format");

const formatDate = (stamp, format) => dfnsFormat(new Date(stamp), format);
module.exports = { formatDate };
