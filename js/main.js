  var app = {}; // create namespace for our app
  var host = "file:///C:/Users/00035098/Desktop/Erasyl/backbone-tutorials/Tweets%20task/index.html";
//*********************************************************************************************************
//----------------------------------Tweets-----------------------------------------------------------------
// Models
   app.Tweet = Backbone.Model.extend({
     defaults: {
        title: '',
        body: '',
        date: '',
        userId: 0,
        userName: '',
        likeCnt: 0
     },
 
     like: function(){
       this.save({ likeCnt: this.get('likeCnt') + 1 });
     },
     dislike: function(){
       this.save({ likeCnt: this.get('likeCnt') - 1 });
     }
   });
 
   // Collections
   app.TweetList = Backbone.Collection.extend({
     model: app.Tweet,
     localStorage: new Store("backbone-tweets"),
 
     completed: function(filterById) {
      console.log(filterById, "filterById");
       return this.filter(function( todo ) {
         return todo.get('userId') == filterById;
       });
     }    
   });
 
   // instance of the Collection
   app.tweetList = new app.TweetList();
   // Views
   // renders individual todo items list (li)
   app.TweetView = Backbone.View.extend({
     tagName: 'li',
     template: _.template($('#item-templateTweet').html()),
     render: function(){
       var context = this.model.toJSON();
       if (localStorage.getItem('currentUser') === false) {
          localStorage.setItem('currentUser', 1);
       }
       context.tmpUserId = localStorage.getItem('currentUser');
       this.$el.html(this.template(context));
       return this; // enable chained calls
     },
     initialize: function(){
       this.model.on('destroy', this.remove, this); // remove: Convenience Backbone's ->
       // -> function for removing the view from the DOM.
     },     
     events: {
       'click .destroyTweet': 'destroyTweet',
       'click .like': 'likeCompleted',
       'click .dislike': 'dislikeCompleted'
     },
     destroyTweet: function() {
       this.model.destroy();
     },
     likeCompleted: function() {
        this.model.like();
        this.render();
     },
     dislikeCompleted: function() {
        this.model.dislike();
        this.render();
      }
   });
 
   // renders the full list of todo items calling TweetView for each one.
   app.TweetsView = Backbone.View.extend({
     el: '#tweets-section',
     initialize: function () {
       this.inputTitle = this.$('#new-title-tweet');
       this.inputBody = this.$('#new-body-tweet');
       app.tweetList.on('add', this.addAllTweet, this);
       app.tweetList.on('reset', this.addAllTweet, this);
       app.tweetList.fetch(); // Loads list from local storage
     },
     events: {
       'click #btn-add-tweet': 'createTweetOnEnter'
     },
     createTweetOnEnter: function(e){
       if (e.which !== 13 && e.which !== 1) { // ENTER_KEY = 13
         return;
       }
       if (this.inputTitle.val().trim().length > 0 && this.inputBody.val().trim().length > 0) {
         app.tweetList.create(this.newAttributesTweet());
       } else {
         alert('Введите данные!');
       }
       this.inputTitle.val(''); // clean inputTitle box
       this.inputBody.val('');
     },
     addOneTweet: function(tweet){
       var viewTweet = new app.TweetView({model: tweet});
       $('#tweet-list').append(viewTweet.render().el);
     },
     addAllTweet: function(){
        this.$('#tweet-list').html(''); // clean the todo list
        if (window.filter >= 0){
          _.each(app.tweetList.completed(window.filter), this.addOneTweet);
        }
        else {
          app.tweetList.each(this.addOneTweet, this);
        }
     },
     newAttributesTweet: function(){
        var dateFull = new Date();
        var currDate = dateFull.getDate();
        var currMonth = dateFull.getMonth();
        var currYear = dateFull.getFullYear();
        var currHour = dateFull.getHours();
        var currMin = dateFull.getMinutes();
        var zer = '';
        var zer2 = '';
        if (currMin < 10) {
          zer = '0';
        }
        if (currMonth < 10) {
          zer2 = '0';
        }
        localStorage.setItem('currentUser', app.userList.last().get('id'));
        return {
          title: this.inputTitle.val().trim(),
          body: this.inputBody.val().trim(),
          date: currHour + ':' + zer + currMin + ' , ' + currDate + ',' + zer2 + currMonth + '.' + currYear,
          userId: app.userList.last().get('id'),
          userName: app.userList.last().get('name'),
          likeCnt: 0
        }
     }
   });
 
   // Initializers
   app.tweetsView = new app.TweetsView();
 
//*************************************************************************************************************
// -------------------------------- Users----------------------------------------------------------------------
   app.User = Backbone.Model.extend({
     defaults: {
        id: 0,
        name: ''
     }
   });
 
   app.UserList = Backbone.Collection.extend({
     model: app.User,
     localStorage: new Store("backbone-users")
   });
 
   app.userList = new app.UserList();
 
   app.UserView = Backbone.View.extend({
     tagName: 'li',
     template: _.template($('#item-template').html()),
     render: function(){
       this.$el.html(this.template(this.model.toJSON()));
       return this;
     },
     initialize: function(){
       this.model.on('destroy', this.remove, this);
     },     
     events: {
       'click .destroy': 'destroyUser'
     },
     destroyUser: function(){
       this.model.destroy();
     }     
   });
 
   app.UsersView = Backbone.View.extend({
     el: '#users-section',
     initialize: function () {
       this.inputUserName = this.$('#new-user-name');
       app.userList.on('reset', this.addAllUsers, this);
       app.userList.fetch();
     },
     events: {
       'click #btn-add-user': 'createUserOnEnter'
     },
     createUserOnEnter: function(e){
       if (e.which !== 13 && e.which !==1 ) {
         return;
       }
       if (this.inputUserName.val().trim().length > 0) {
         app.userList.create(this.newAttributesUser());
       } else {
          alert('Введите данные!');
       }
       this.inputUserName.val('');
     },
     addOneUser: function(user){
       var view = new app.UserView({model: user});
       $('#user-list').append(view.render().el);
     },
     addAllUsers: function(){
       this.$('#user-list').html('');
       app.userList.each(this.addOneUser, this);
     },
     newAttributesUser: function(){
       var lastId = 1;
       if (app.userList.length > 0) {
          console.log(app.userList.length, '- userList');
          lastId = app.userList.at(app.userList.length - 1).get('id') + 1;
       }
       return {
         id: lastId,
         name: this.inputUserName.val().trim(),
       }
     }
   });
 
   //------------------------------------------
   // Router
   //------------------------------------------
 
   app.Router = Backbone.Router.extend({
    routes: {
      'tweets/:id' : 'setFilter'
    },
    setFilter: function(id) {
      console.log('app.router.params = ' + id); // just for didactical purposes.
      app.admin = localStorage.setItem('currentUser', id);
      console.log('localStorage.getItem(currentUser) = ' + localStorage.getItem('currentUser'));
      window.filter = id.trim() || '';
      app.tweetList.trigger('reset');
    }
  });    
 
   //--------------
   // Initializers
   //--------------  
 
   app.router = new app.Router();
   Backbone.history.start();   
   app.appView = new app.UsersView();