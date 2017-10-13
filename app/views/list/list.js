var dialogsModule = require("ui/dialogs");
var swipeDelete = require("../../shared/utils/ios-swipe-delete");
var socialShare = require("nativescript-social-share");
var observableModule = require("data/observable")
var GroceryListViewModel = require("../../shared/view-models/grocery-list-view-model");
var ObservableArray = require("data/observable-array").ObservableArray;
var page;

var groceryList = new GroceryListViewModel([]);
var pageData = new observableModule.fromObject({
    groceryList: groceryList,
    grocery: ""
});

exports.add = function() {
  if (!pageData.get("grocery").trim() === "") {
    return;
  }

  page.getViewById("grocery").dismissSoftInput();
  groceryList.add(pageData.get("grocery"))
  .catch(function(){
    dialogsModule.alert({
      message: "An error has occured while adding an item to your list.",
      okButtonText: "OK"
    })
  })
  pageData.set("grocery", "")
};


exports.loaded = function(args) {
  page = args.object;
  if (page.ios) {
    var listView = page.getViewById("groceryList");
    swipeDelete.enable(listView, function(index) {
        groceryList.delete(index);
    });
}
  var listView = page.getViewById("groceryList");
  page.bindingContext = pageData;

  groceryList.empty();
  pageData.set("isLoading", true);
  groceryList.load().then(function() {
      pageData.set("isLoading", false);
      listView.animate({
          opacity: 1,
          duration: 1000
      });
  });
};

exports.share = function() {
  var list = [];
  for (var i = 0, size = groceryList.length; i < size ; i++) {
      list.push(groceryList.getItem(i).name);
  }
  var listString = list.join(", ").trim();
  socialShare.shareText(listString);
};

exports.delete = function(args) {
  var item = args.view.bindingContext;
  var index = groceryList.indexOf(item);
  groceryList.delete(index);
};