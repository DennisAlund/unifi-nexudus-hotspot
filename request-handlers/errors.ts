export const error = (err, req, res, next) => {    
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  res.status(err.status || 500);
  res.render('error');
};

export const notFound = (req, res, next) => {
  next({
    message: "Not found",
    status: 404
  });
};