/**
 * Created by dong on 2016/12/30.
 */

var PingppError = require('./errors').Error;
var hasOwn = {}.hasOwnProperty;

module.exports = {
  id: null,
  or_id: null,
  channel: null,
  app: null,
  credential: {},
  extra: null,
  livemode: null,
  order_no: null,
  time_expire: null,
  paid: false,
  status: null,
  actual_amount: null,

  init: function (charge_or_order) {
    var charge;
    if (typeof charge_or_order === 'string') {
      try {
        charge = JSON.parse(charge_or_order);
      } catch (err) {
        throw new PingppError('json_decode_fail', err);
      }
    } else {
      charge = charge_or_order;
    }

    if (typeof charge === 'undefined') {
      throw new PingppError('json_decode_fail');
    }

    if (hasOwn.call(charge, 'object') && charge.object == 'order') {
      charge.or_id = charge.id;
      charge.order_no = charge.merchant_order_no;
      var charge_essentials = charge.charge_essentials;
      charge.channel = charge_essentials.channel;
      charge.credential = charge_essentials.credential;
      charge.extra = charge_essentials.extra;
      if(hasOwn.call(charge, 'charge') && charge.charge != null) {
        charge.id = charge.charge;
      } else if(hasOwn.call(charge_essentials, 'id')
        && charge_essentials.id != null) {
        charge.id = charge_essentials.id;
      } else if(hasOwn.call(charge, 'charges')) {
        for(var i = 0; i < charge.charges.data.length; i++){
          if(charge.charges.data[i].channel === charge_essentials.channel) {
            charge.id = charge.charges.data[i].id;
            break;
          }
        }
      }
    } else if(hasOwn.call(charge, 'object') && charge.object == 'recharge') {
      charge = charge.charge;
    }

    for (var key in this) {
      if (hasOwn.call(charge, key)) {
        this[key] = charge[key];
      }
    }
    return this;
  },

  clear: function () {
    for (var key in this) {
      if (typeof this[key] !== 'function') {
        this[key] = null;
      }
    }
  }
};