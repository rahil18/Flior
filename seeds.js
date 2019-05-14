var mongoose = require("mongoose");
var event = require("./models/event");
var Comment   = require("./models/comment");
 
var data = [
    {
        name: "Bike ride across Hoboken!", 
        image: "https://www.biglifemag.com/wp-content/uploads/MTB-Aspen-Valhalla-Harrison-Buck.jpg",
        description: "Love Biking? Pack your gear and bring along your bikes for a 4 hour bike ride across Hoboken City organized by Stevens Graduate Students Association!"
    },
    {
        name: "LoL Gaming Night!", 
        image: "https://se-infra-imageserver2.azureedge.net/clink/images/fb31aae3-e9b3-43db-ad3d-207cfab13f6c86ea9a6e-ebb7-4acd-bacd-7007b5d4ea7b.png?preset=large-w",
        description: "Come join us and spend the whole night for the college’s biggest gaming event."
    },
    {
        name: "International Food Festival", 
        image: "https://i1.wp.com/storage.googleapis.com/website-zkhiphani/uploads/2016/09/DStv-Delicious-International-Food-Music-Festival.jpeg?resize=1000%2C600&ssl=1",
        description: "Are you a foodie? Come join us for a full day food festival event organized in front of Babbio Center including delicacies from around the world."
    },
    {
        name: "Python Bootcamp", 
        image: "https://se-infra-imageserver2.azureedge.net/clink/images/29ed4a50-9eac-4a29-817e-de6d89703aaa4ad30820-d7c5-40c1-b57b-dc3f79d226fe.png?preset=large-w",
        description: "Three hours is all you need to kickstart you inner pythonista! Come join us at Babbio 215 (3:00PM/05/30) and learn the basics of Python!"
    }
]
 
function seedDB(){
   //Remove all events
   event.remove({}, function(err){
        if(err){
            console.log(err);
        }
        console.log("removed events!");
        Comment.remove({}, function(err) {
            if(err){
                console.log(err);
            }
            // console.log("removed comments!");
            //  add a few events
            data.forEach(function(seed){
                event.create(seed, function(err, event){
                    if(err){
                        console.log(err)
                    } else {
                        console.log("added an event");
                    }
                });
            });
        });
    }); 
    //add a few comments
}
 
module.exports = seedDB;