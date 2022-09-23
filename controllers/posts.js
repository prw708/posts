const { v4: uuidv4 } = require('uuid');
const { body, param, query, matchedData, validationResult } = require('express-validator');

const cookieOptions = require('../../scripts/cookieOptions');
const utils = require('../../scripts/utilities');
const winston = require('../../scripts/log');
const rateLimiter = require('../../scripts/rateLimiter');

const web = require('../../dbWeb.js');

const BASEPATH = '/projects/posts';

exports.home_get = function(req, res, next) {
  res.render('../posts/views/all', {
    title: 'Posts',
  });
};

exports.users_get = function(req, res, next) {
  web.user.find({})
    .exec()
    .then(function(users) {
      if (!users) {
        return Promise.reject(null);
      } else {
        res.status(200).json(users);
      }
    })
    .catch(function(err) {
      if (err) {
        winston.logger.error(err);
      }
      res.status(400).json('Get users failed.');
    });
};

exports.posts_get = function(req, res, next) {
  web.post.find({})
    .sort({ date: 'desc' })
    .exec()
    .then(function(posts) {
      if (!posts) {
        return Promise.reject(null);
      } else {
        res.status(200).json(posts);
      }
    })
    .catch(function(err) {
      if (err) {
        winston.logger.error(err);
      }
      res.status(400).json('Get posts failed.');
    });
};

exports.posts_paged_get = [
  param('size', 'Invalid value.')
    .trim()
    .escape()
    .isNumeric({ no_symbols: true })
    .isInt({ min: 1 })
    .toInt(10),
  function(req, res, next) {
    let data = matchedData(req, { includeOptionals: true, onlyValidData: true, locations: ['params'] });
    let errors = validationResult(req);
    let size = 5;
    if (errors.isEmpty()) {
      size = data.size;
    }
    web.post.find({})
      .sort({ date: 'desc' })
      .limit(size)
      .exec()
      .then(function(posts) {
        if (!posts) {
          return Promise.reject(null);
        } else {
          res.status(200).json(posts);
        }
      })
      .catch(function(err) {
        if (err) {
          winston.logger.error(err);
        }
        res.status(400).json('Get posts failed.');
      });
  }
];

exports.posts_user_paged_get = [
  param('author', 'Must be between 1 to 50 characters. Can contain A-Z, a-z, 0-9, and -.')
    .trim()
    .isLength({ min: 1, max: 50 })
    .matches(/^[A-Za-z0-9\-]+$/)
    .whitelist('A-Za-z0-9\-')
    .escape(),
  param('size', 'Invalid value.')
    .trim()
    .escape()
    .isNumeric({ no_symbols: true })
    .isInt({ min: 1 })
    .toInt(10),
  function(req, res, next) {
    let data = matchedData(req, { includeOptionals: true, onlyValidData: true, locations: ['params'] });
    let errors = validationResult(req);
    let size = 5;
    if (errors.isEmpty()) {
      size = data.size;
      web.post.find({ author: data.author })
        .sort({ date: 'desc' })
        .limit(size)
        .exec()
        .then(function(posts) {
          if (!posts) {
            return Promise.reject(null);
          } else {
            res.status(200).json(posts);
          }
        })
        .catch(function(err) {
          if (err) {
            winston.logger.error(err);
          }
          res.status(400).json('Get posts failed.');
        });
    } else {
      res.status(400).json('Get posts failed.');
    }
  }
];

exports.posts_add_post = [
  body('title', 'Must not be empty. Can contain A-Z, a-z, 0-9, spaces, and _.,?!"\'-.')
    .trim()
    .isLength({ min: 1, max: 100 })
    .matches(/^[A-Za-z0-9 _.,?!"'-]{1,100}$/)
    .whitelist('A-Za-z0-9 _.,?!"\'\\-'),
  body('post', 'Must not be empty. Can contain A-Z, a-z, 0-9, spaces, and _.,?!"\'-.')
    .trim()
    .isLength({ min: 1, max: 200 })
    .matches(/^[A-Za-z0-9 _.,?!"'\s-]{1,200}$/)
    .whitelist('A-Za-z0-9 _.,?!"\'\\s\\-'),
  body('author', 'Must be between 1 to 50 characters. Can contain A-Z, a-z, 0-9, and -.')
    .trim()
    .isLength({ min: 1, max: 50 })
    .matches(/^[A-Za-z0-9\-]+$/)
    .whitelist('A-Za-z0-9\-')
    .escape(),
  body('time', 'Invalid value.')
    .trim()
    .escape()
    .isNumeric({ no_symbols: true })
    .isInt()
    .toInt(10),
  body('g-recaptcha-response', 'Failed reCAPTCHA test.')
    .trim()
    .escape()
    .matches(/^[A-Za-z0-9_\-]+$/),
  async function(req, res, next) {
    let data = matchedData(req, { includeOptionals: true, onlyValidData: true, locations: ['body'] });
    let errors = validationResult(req);
    let pastTime = utils.pastTimeFrame(data.time, 2);
    if (!req.session.loggedInAs || !req.session.loggedInAsId) {
      res.status(401).json('Not logged in.');
    } else if (errors.isEmpty() && pastTime) {
      try {
        const url = 'https://www.google.com/recaptcha/api/siteverify';
        const requestData = 'secret=' + encodeURIComponent(process.env.RECAPTCHA_SECRET_KEY) + '&' + 
                            'response=' + encodeURIComponent(data['g-recaptcha-response']);
        let success = await utils.postJSON(url, {}, requestData, (parsedJSON) => {
          if (parsedJSON.success === true && 
              parsedJSON.score >= 0.7 && 
              parsedJSON.action === 'add' &&
              parsedJSON.hostname === req.hostname) {
            return true;
          } else {
            throw new Error('Failed reCAPTCHA test.');
          }
        });
        let count;
        web.post.countDocuments({ author: req.session.loggedInAs }).exec()
        .then(function(postsCount) {
          count = postsCount;
          return web.userLevel.findOne({ user: req.session.loggedInAsId }).exec();
        })
        .then(function(userLevel) {
          if ((count + 1) > userLevel.maxPosts) {
            return Promise.reject('The maximum amount of posts you can create has been reached.');
          }
          userLevel.experience += 10;
          return userLevel.save();
        })
        .then(async function(userLevel) {
          let newPost = new web.post({
            id: uuidv4(),
            title: data.title,
            post: data.post,
            author: data.author,
            date: new Date(),
            comments: []
          });
          await newPost.save();
          newPost.date = newPost.date.toISOString();
          res.status(200).json(newPost);
        })
        .catch(function(error) {
          errors = errors.array({ onlyFirstError: true });
          if (error) {
            errors.push({
              param: 'addPostMessage',
              msg: error 
            });
          } else {
            errors.push({
              param: 'addPostMessage',
              msg: 'Add post failed.'
            });
          }
          res.status(400).json(errors);
        });
      } catch (error) {
        errors = errors.array({ onlyFirstError: true });
        errors.push({
          param: 'addPostMessage',
          msg: 'Add post failed.'
        });
        res.status(400).json(errors);
      }
    } else {
      errors = errors.array({ onlyFirstError: true });
      res.status(400).json(errors);
    }
  }
];

exports.posts_update_post = [
  body('id', 'Invalid ID.')
    .trim()
    .isLength({ min: 36, max: 36 })
    .matches(/^[A-Fa-f0-9\-]{36}$/)
    .whitelist('A-Fa-f0-9\\-')
    .escape(),
  body('title', 'Must not be empty. Can contain A-Z, a-z, 0-9, spaces, and _.,?!"\'-.')
    .trim()
    .isLength({ min: 1, max: 100 })
    .matches(/^[A-Za-z0-9 _.,?!"'-]{1,100}$/)
    .whitelist('A-Za-z0-9 _.,?!"\'\\-'),
  body('post', 'Must not be empty. Can contain A-Z, a-z, 0-9, spaces, and _.,?!"\'-.')
    .trim()
    .isLength({ min: 1, max: 200 })
    .matches(/^[A-Za-z0-9 _.,?!"'\s-]{1,200}$/)
    .whitelist('A-Za-z0-9 _.,?!"\'\\s\\-'),
  body('author', 'Must be between 1 to 50 characters. Can contain A-Z, a-z, 0-9, and -.')
    .trim()
    .isLength({ min: 1, max: 50 })
    .matches(/^[A-Za-z0-9\-]+$/)
    .whitelist('A-Za-z0-9\\-')
    .escape(),
  body('time', 'Invalid value.')
    .trim()
    .escape()
    .isNumeric({ no_symbols: true })
    .isInt()
    .toInt(10),
  body('g-recaptcha-response', 'Failed reCAPTCHA test.')
    .trim()
    .escape()
    .matches(/^[A-Za-z0-9_\-]+$/),
  function(req, res, next) {
    let data = matchedData(req, { includeOptionals: true, onlyValidData: true, locations: ['body'] });
    let errors = validationResult(req);
    let pastTime = utils.pastTimeFrame(data.time, 2);
    if (!req.session.loggedInAs || !req.session.loggedInAsId) {
      res.status(401).json('Not logged in.');
    } else if (errors.isEmpty() && pastTime) {
      const url = 'https://www.google.com/recaptcha/api/siteverify';
      const requestData = 'secret=' + encodeURIComponent(process.env.RECAPTCHA_SECRET_KEY) + '&' + 
                          'response=' + encodeURIComponent(data['g-recaptcha-response']);
      utils.postJSON(url, {}, requestData, (parsedJSON) => {
        if (parsedJSON.success === true && 
            parsedJSON.score >= 0.7 && 
            parsedJSON.action === 'update' &&
            parsedJSON.hostname === req.hostname) {
          return web.post.findOne({ id: data.id, author: req.session.loggedInAs }).exec();
        } else {
          return Promise.reject('Failed reCAPTCHA test.');
        }
      })
      .then(function(match) {
        if (!match) {
          return Promise.reject(null);
        }
        match.title = data.title;
        match.post = data.post;
        match.date = Date.now();
        return match.save();
      })
      .then(function(match) {
        match.date = match.date.toISOString();
        res.status(200).json(match);
      })
      .catch(function(err) {
        if (err) {
          winston.logger.error(err);
        }
        errors = errors.array({ onlyFirstError: true });
        errors.push({
          param: 'editPostMessage',
          msg: 'Edit post failed.'
        });
        res.status(400).json(errors);
      });
    } else {
      errors = errors.array({ onlyFirstError: true });
      res.status(400).json(errors);
    }
  }
];

exports.posts_delete_post = [
  body('id', 'Invalid ID.')
    .trim()
    .isLength({ min: 36, max: 36 })
    .matches(/^[A-Fa-f0-9\-]{36}$/)
    .whitelist('A-Fa-f0-9\\-')
    .escape(),
  body('author', 'Must be between 1 to 50 characters. Can contain A-Z, a-z, 0-9, and -.')
    .trim()
    .isLength({ min: 1, max: 50 })
    .matches(/^[A-Za-z0-9\-]+$/)
    .whitelist('A-Za-z0-9\\-')
    .escape(),
  body('time', 'Invalid value.')
    .trim()
    .escape()
    .isNumeric({ no_symbols: true })
    .isInt()
    .toInt(10),
  body('g-recaptcha-response', 'Failed reCAPTCHA test.')
    .trim()
    .escape()
    .matches(/^[A-Za-z0-9_\-]+$/),
  function(req, res, next) {
    let data = matchedData(req, { includeOptionals: true, onlyValidData: true, locations: ['body'] });
    let errors = validationResult(req);
    let pastTime = utils.pastTimeFrame(data.time, 2);
    if (!req.session.loggedInAs || !req.session.loggedInAsId) {
      res.status(401).json('Not logged in.');
    } else if (errors.isEmpty() && pastTime) {
      const url = 'https://www.google.com/recaptcha/api/siteverify';
      const requestData = 'secret=' + encodeURIComponent(process.env.RECAPTCHA_SECRET_KEY) + '&' + 
                          'response=' + encodeURIComponent(data['g-recaptcha-response']);
      utils.postJSON(url, {}, requestData, (parsedJSON) => {
        if (parsedJSON.success === true && 
            parsedJSON.score >= 0.7 && 
            parsedJSON.action === 'delete' &&
            parsedJSON.hostname === req.hostname) {
          return web.post.findOneAndDelete({ id: data.id, author: req.session.loggedInAs }).exec();
        } else {
          return Promise.reject('Failed reCAPTCHA test.');
        }
      })
      .then(function(match) {
        if (!match) {
          return Promise.reject(null);
        }
        match.date = match.date.toISOString();
        res.status(200).json(match);
      })
      .catch(function(err) {
        if (err) {
          winston.logger.error(err);
        }
        errors = errors.array({ onlyFirstError: true });
        errors.push({
          param: 'deletePostMessage',
          msg: 'Delete post failed.'
        });
        res.status(400).json(errors);
      });
    } else {
      errors = errors.array({ onlyFirstError: true });
      res.status(400).json(errors);
    }
  }
];

exports.comments_add_post = [
  body('id', 'Invalid ID.')
    .trim()
    .isLength({ min: 36, max: 36 })
    .matches(/^[A-Fa-f0-9\-]{36}$/)
    .whitelist('A-Fa-f0-9\\-')
    .escape(),
  body('comment', 'Must not be empty. Can contain A-Z, a-z, 0-9, spaces, and _.,?!"\'-.')
    .trim()
    .isLength({ min: 1, max: 200 })
    .matches(/^[A-Za-z0-9 _.,?!"'\s-]{1,200}$/)
    .whitelist('A-Za-z0-9 _.,?!"\'\\s\\-'),
  body('author', 'Must be between 1 to 50 characters. Can contain A-Z, a-z, 0-9, and -.')
    .trim()
    .isLength({ min: 1, max: 50 })
    .matches(/^[A-Za-z0-9\-]+$/)
    .whitelist('A-Za-z0-9\-')
    .escape(),
  body('threadId', 'Invalid value.')
    .trim()
    .escape()
    .isNumeric({ no_symbols: false })
    .isInt()
    .toInt(10),
  body('time', 'Invalid value.')
    .trim()
    .escape()
    .isNumeric({ no_symbols: true })
    .isInt()
    .toInt(10),
  body('g-recaptcha-response', 'Failed reCAPTCHA test.')
    .trim()
    .escape()
    .matches(/^[A-Za-z0-9_\-]+$/),
  function(req, res, next) {
    let data = matchedData(req, { includeOptionals: true, onlyValidData: true, locations: ['body'] });
    let errors = validationResult(req);
    let pastTime = utils.pastTimeFrame(data.time, 2);
    if (!req.session.loggedInAs || !req.session.loggedInAsId) {
      res.status(401).json('Not logged in.');
    } else if (errors.isEmpty() && pastTime) {
      let comment;
      const url = 'https://www.google.com/recaptcha/api/siteverify';
      const requestData = 'secret=' + encodeURIComponent(process.env.RECAPTCHA_SECRET_KEY) + '&' + 
                          'response=' + encodeURIComponent(data['g-recaptcha-response']);
      utils.postJSON(url, {}, requestData, (parsedJSON) => {
        if (parsedJSON.success === true && 
            parsedJSON.score >= 0.7 && 
            parsedJSON.action === 'addComment' &&
            parsedJSON.hostname === req.hostname) {
          return web.post.findOne({ id: data.id }).exec();
        } else {
          return Promise.reject('Failed reCAPTCHA test.');
        }
      })
      .then(function(match) {
        if (!match) {
          return Promise.reject(null);
        }
        comment = {
          id: uuidv4(),
          postId: data.id,
          author: data.author,
          date: new Date(),
          comment: data.comment,
          threadId: data.threadId
        };
        if (data.threadId === -1) {
          match.comments.push([comment]);
        } else {
          match.comments[data.threadId].push(comment);
        }
        return match.save();
      })
      .then(function(match) {
        comment.date = comment.date.toISOString();
        return web.userLevel.findOne({ user: req.session.loggedInAsId }).exec();
      })
      .then(function(userLevel) {
        userLevel.experience++;
        return userLevel.save();
      })
      .then(function(userLevel) {
        res.status(200).json(comment);
      })
      .catch(function(err) {
        if (err) {
          winston.logger.error(err);
        }
        errors = errors.array({ onlyFirstError: true });
        errors.push({
          param: 'addCommentMessage',
          msg: 'Add comment failed.'
        });
        res.status(400).json(errors);
      });
    } else {
      errors = errors.array({ onlyFirstError: true });
      res.status(400).json(errors);
    }
  }
];

exports.comments_delete_post = [
  body('id', 'Invalid ID.')
    .trim()
    .isLength({ min: 36, max: 36 })
    .matches(/^[A-Fa-f0-9\-]{36}$/)
    .whitelist('A-Fa-f0-9\\-')
    .escape(),
  body('commentId', 'Invalid value.')
    .trim()
    .escape()
    .isNumeric({ no_symbols: false })
    .isInt()
    .toInt(10),
  body('threadId', 'Invalid value.')
    .trim()
    .escape()
    .isNumeric({ no_symbols: false })
    .isInt()
    .toInt(10),
  body('author', 'Must be between 1 to 50 characters. Can contain A-Z, a-z, 0-9, and -.')
    .trim()
    .isLength({ min: 1, max: 50 })
    .matches(/^[A-Za-z0-9\-]+$/)
    .whitelist('A-Za-z0-9\\-')
    .escape(),
  body('time', 'Invalid value.')
    .trim()
    .escape()
    .isNumeric({ no_symbols: true })
    .isInt()
    .toInt(10),
  body('g-recaptcha-response', 'Failed reCAPTCHA test.')
    .trim()
    .escape()
    .matches(/^[A-Za-z0-9_\-]+$/),
  function(req, res, next) {
    let data = matchedData(req, { includeOptionals: true, onlyValidData: true, locations: ['body'] });
    let errors = validationResult(req);
    let pastTime = utils.pastTimeFrame(data.time, 2);
    if (!req.session.loggedInAs || !req.session.loggedInAsId) {
      res.status(401).json('Not logged in.');
    } else if (errors.isEmpty() && pastTime) {
      const url = 'https://www.google.com/recaptcha/api/siteverify';
      const requestData = 'secret=' + encodeURIComponent(process.env.RECAPTCHA_SECRET_KEY) + '&' + 
                          'response=' + encodeURIComponent(data['g-recaptcha-response']);
      utils.postJSON(url, {}, requestData, (parsedJSON) => {
        if (parsedJSON.success === true && 
            parsedJSON.score >= 0.7 && 
            parsedJSON.action === 'deleteComment' &&
            parsedJSON.hostname === req.hostname) {
          return web.post.findOne({ id: data.id }).exec();
        } else {
          return Promise.reject('Failed reCAPTCHA test.');
        }
      })
      .then(function(match) {
        if (!match || match.comments[data.threadId][data.commentId].author !== data.author) {
          return Promise.reject(null);
        }
        if (data.commentId === 0) {
          match.comments.splice(data.threadId, 1)
        } else {
          match.comments[data.threadId].splice(data.commentId, 1);
          if (match.comments[data.threadId].length === 0) {
            match.comments.splice(data.threadId, 1);
          }
        }
        return match.save();
      })
      .then(function(doc) {
        res.status(200).json({
          id: data.id,
          threadId: data.threadId,
          commentId: data.commentId
        });
      })
      .catch(function(err) {
        if (err) {
          winston.logger.error(err);
        }
        errors = errors.array({ onlyFirstError: true });
        errors.push({
          param: 'deleteCommentMessage',
          msg: 'Delete comment failed.'
        });
        res.status(400).json(errors);
      });
    } else {
      errors = errors.array({ onlyFirstError: true });
      res.status(400).json(errors);
    }
  }
];
