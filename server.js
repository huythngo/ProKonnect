const app = require('./app')

// serve static assets in production
if (process.env.NODE_ENV === 'production') {
  // set static folder
  app.use(express.static('client/build'));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  });
} 

if (process.env.NODE_ENV === 'test') {
  // set static folder
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`server is up on port ${PORT}`);
  });
} 

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`server is up on port ${PORT}`);
});
