
create database YumRush;
go
use YumRush;
create table Users(
userName nvarchar(50) ,
name nvarchar(50) not null,
password nvarchar(100) not null ,
photo nvarchar(100),
email nvarchar(100) not null ,
phoneNumber nvarchar(15) not null,
type char not null,
passwordChangedAt datetime2 ,
primary key(userName)
);
-----------------------------------------------------------------------
create table customerAddress(
location varchar(100),
customerId nvarchar(50) ,
foreign key (customerId) references Users(userName)
on delete cascade,
primary key(location,customerId));
-------------------------------------------------------------------------
create table Wallets_Cards(
number varchar(20) ,
type varchar(10) not null,
customerId nvarchar(50) ,
foreign key (customerId) references Users (userName)
on delete cascade,
primary key(number,customerId));
------------------------------------------------------------------

create table Tickets(
ticketId int identity(1,1),
subject varchar(50),
message varchar(200) not null,
status varchar(20) not null,
createdAt datetime2,
customerId nvarchar(50) not null,
foreign key (customerId) references Users (userName),
primary key (ticketId)
)

create table proccessedTickets(
responseMessage varchar(200) not null,
responseTime datetime2 not null,
ticketId int,
foreign key (ticketId) references Tickets (ticketId)
on delete cascade,
supportId nvarchar(50) ,
foreign key (supportId) references Users (userName),
primary key(ticketId))


create table restaurantOwner(
userName nvarchar(50) ,
foreign key (userName) references Users (userName)
on delete cascade,
primary key(userName),
bankId varchar(20) not null
)
-------------------------------------------
create table Restaurant(
restaurantId int identity(1,1) ,
category varchar(50)not null,
photo varchar(100),
openingHours varchar(20) not null,
restaurantName nvarchar(50) not null unique,
description varchar(200) ,
location varchar(100) not null,
balance float,
managerID nvarchar(50) not null,
foreign key (managerID) references restaurantOwner (userName)
on delete cascade,
primary key(restaurantId)
)
---------------------------------------
create table menuItems(
name varchar(20),
photo nvarchar(100),
menuCategory varchar(50)not null,
price decimal(10,2) not null,
finalPrice decimal(10,2) ,
availableAmount int,
description varchar(200) ,
discount decimal(10,2),
restaurantId int ,
foreign key (restaurantId) references Restaurant (restaurantId)
on delete cascade,
primary key (name,restaurantId)
)
--------------------------------------------------------------------
--create table Challenges(
--rewardId int identity (1,1),
--targetNumber int not null,
--prize varchar(50) not null,
--restaurantId int ,
--foreign key (restaurantId) references Restaurant (restaurantId)
--on delete cascade,
--primary key (rewardId,restaurantId)
--)

--create table challengesWinners(
--customerId nvarchar(50) ,
--foreign key (customerId) references Users (userName),
--rewardId int,
--restaurantId int ,
--foreign key(rewardId,restaurantId) references Challenges (rewardId,restaurantId)
--on delete cascade,
--primary key(rewardId,restaurantId,customerId)
--)

create table kitchenStaff(
userName nvarchar(50) ,
foreign key (userName) references Users (userName),

primary key(userName),
restaurantId int not null,
foreign key (restaurantId) references Restaurant (restaurantId)
on delete cascade);
------------------------------------------------------------------------
create table deliveryPerson(
userName nvarchar(50) ,
foreign key (userName) references Users (userName)
on delete cascade,
bankId varchar(20) not null ,
vehicleType nvarchar(50)not null,
licenseNumber varchar(20) not null,
id varchar(20) not null unique,
primary key(userName)
);
-------------------------------------------------------
create table Payment(
paymentId int identity(1,1),
amount decimal(10,2) not null,
paymentStatus varchar(20) not null,
time datetime2 not null,
primary key(paymentId))
----------------------------------------------------

create table Orders(
orderId int identity (1,1),
location varchar(100) not null,
orderTime datetime2 not null,
itemsPrice decimal(10,2) not null,
deliveryFee decimal(10,2),
status varchar(20) not null,
customerId nvarchar(50) not null,
foreign key (customerId) references Users (userName),
restaurantId int not null,
foreign key (restaurantId) references Restaurant (restaurantId),
primary key (orderId)
)
---------------------------------------------------------
create table onDeliverOrders(
deliveryTime decimal(10,2),
deliveryId nvarchar(50) not null,
tipAmount decimal(10,2),
foreign key (deliveryId) references deliveryPerson (userName),
orderId int,
foreign key (orderId) references Orders (orderId)
on delete cascade,
primary key (orderId))


create table onPrepareOrders(
preparingTime decimal(10,2),
kitchenStaffId nvarchar(50) not null,
foreign key (kitchenStaffId) references kitchenStaff (userName),
orderId int,
foreign key (orderId) references Orders (orderId)
on delete cascade,
primary key (orderId))


create table orderItems(
quantity int not null,
orderId int,
foreign key (orderId) references Orders (orderId)
on delete cascade,
itemName varchar(20) not null,
restaurantId int ,
foreign key (itemName,restaurantId) references menuItems (name,restaurantId)
on delete cascade,
primary key (orderId,itemName))

create table orderReview (
deliverRating decimal(10,2),
restaurantRating decimal(10,2),
customerId nvarchar(50) not null,
foreign key (customerId) references Users (userName),
orderId int,
foreign key (orderId) references Orders (orderId)
on delete cascade,
primary key (orderId)
)


create table deliveryChat(
messageId int identity(1,1),
message varchar(100) not null,
timeSent datetime2 not null,
status varchar(20) not null,
SRFlag char not null,
orderId int,
foreign key (orderId) references Orders (orderId),
primary key (messageId))

create table restaurantChat(
messageId int identity(1,1),
message varchar(100) not null,
timeSent datetime2 not null,
status varchar(20) not null,
SRFlag char not null,
orderId int,
foreign key (orderId) references Orders (orderId),
primary key (messageId))



create table paymentWithCard_Wallet(
paymentAmount float,
paymentId int,
foreign key (paymentId) references Payment (paymentId)
on delete cascade ,
customerId nvarchar(50) not null,
number varchar(20) not null,
foreign key (number,customerId) references Wallets_Cards (number,customerId),
orderId int,
foreign key (orderId) references Orders (orderId),
primary key(paymentId)
)

create table Coupons(
couponId int identity(1,1),
restaurantID int not null,
amount decimal(10,2) not null,
available_uses int not null,
foreign key (restaurantID) references Restaurant (restaurantId),
primary key(couponId))
------------------------------------------------------------------
--create table customerCoupons(
--status varchar(20),
--couponId int,
--foreign key (couponId) references Coupons (couponId),
--customerId nvarchar(50) not null,
--foreign key (customerId) references Users (userName)
--on delete cascade,
--primary key (customerId,couponId)
--)

create table paymentWithCoupons(
paymentAmount float,
paymentId int,
foreign key (paymentId) references Payment (paymentId)
on delete cascade ,
couponId int not null,
foreign key (couponId) references Coupons (couponId),
orderId int,
foreign key (orderId) references Orders (orderId),
primary key(paymentId)
)

create table Subscription(
planName varchar(50) ,
price decimal(10,2) not null,
restaurantID int not null,
amount decimal(10,2) not null,
FreeDelivery bit,
period int not null,
foreign key (restaurantID) references Restaurant (restaurantId),
primary key(planName,restaurantID))
---------------------------------------------------------------------
create table customerSubscription(
status varchar(20),
startDate datetime2,
subscriptionId varchar(50),
restaurantID int not null,
foreign key (subscriptionId,restaurantID) references Subscription (planName,restaurantID)
on delete cascade,
customerId nvarchar(50) not null,
foreign key (customerId) references Users (userName)
on delete cascade,
paymentId int ,
foreign key (paymentId) references Payment (paymentId),
primary key (customerId,subscriptionId,restaurantID)
)

create table paymentWithSubscription(
paymentAmount float,
paymentId int,
foreign key (paymentId) references Payment (paymentId)
on delete cascade ,
customerId nvarchar(50) not null,
subscriptionId varchar(50) not null,
restaurantID int not null,
foreign key (customerId,subscriptionId,restaurantID) references customerSubscription (customerId,subscriptionId,restaurantID)
on delete cascade,
orderId int,
foreign key (orderId) references Orders (orderId),
primary key(paymentId)
)



