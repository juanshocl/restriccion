import mandrill from 'mandrill-api/mandrill';
import moment from 'moment';
import {log} from '../modules/logger';
import {__MANDRILL_KEY__} from '../config/mandrill';
//import {map} from 'ramda';

const mandrillClient = new mandrill.Mandrill(__MANDRILL_KEY__);
moment.locale('es');

// TODO: actualizar documentacion y nombres de variables
/**
 * Sends Restriction Notification Emails to Users
 * @param  {array}    users array
 * @param  {object}   object with the latest scraped data
 * @param  {function} callback
 */
export function sendEmail(users, info, done){


  const emails = users.map(user => user.email);

  const mergeVars = users.map(em => {

    var obj = {};
    obj.rcpt = em.email;
    obj.vars = [];
    var param1 = {};
    param1.name = 'EMAIL';
    param1.content = em.email;
    var param2 = {};
    param2.name = 'TOKEN';
    param2.content = em.token;
    obj.vars.push(param1);
    obj.vars.push(param2);

    return obj;
  });


  const templateName = 'tengoRestriccion';
  const message = {
    'inline_css': true,
    'to'        : emails,
    'merge'     : true,
    'merge_vars': mergeVars
  };

  const templateContent = [
    {
      'name'   : 'fecha',
      'content': moment(info.fecha).format('dddd DD MMMM YYYY')
    },
    {
      'name'   : 'estatus',
      'content': info.estatus
    },
    {
      'name'   : 'conSello',
      'content': (info.numeros.conSello.length > 0) ? info.numeros.conSello.join('-') : 'Sin restricción'
    },
    {
      'name'   : 'sinSello',
      'content': info.numeros.sinSello.join('-')
    }
  ];

  mandrillClient.messages.sendTemplate({
    'template_name'   : templateName,
    'template_content': templateContent,
    'message'         : message
  }, result => {
    log.info({'mailSender#sendEmail': { result }});
  }, error => {
    log.error({'mailSender#sendEmail': { error }});
  });

  done();
}
