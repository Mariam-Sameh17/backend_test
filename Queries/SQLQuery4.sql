
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE or alter PROCEDURE GetSubscriptionRevenue
    @restaurantId INT
AS
BEGIN

    SELECT SUM(s.price) AS subRevenue
    FROM customerSubscription cs
    JOIN Subscription s ON cs.subscriptionId = s.planName
    WHERE cs.restaurantId = @restaurantId;
END;
GO


CREATE OR ALTER PROCEDURE GetRestaurantRating
    @restaurantId INT
AS
BEGIN
  
    SELECT AVG(r.restaurantRating) AS rate
    FROM OrderReview r
    JOIN Orders o ON r.orderId = o.orderId
    WHERE o.restaurantId = @restaurantId;
END;
GO



CREATE OR ALTER PROCEDURE GetRestaurantOrders
    @restaurantId INT
AS
BEGIN
       SELECT 
        o.*,
        u.name AS customerName,
        u.phoneNumber AS customerPhone,
        (SELECT SUM(quantity) 
                FROM OrderItems oi 
                WHERE oi.orderId = o.orderId) AS items
    FROM Orders o
    JOIN Users u ON o.customerId = u.userName
    WHERE o.restaurantId = @restaurantId;
END;
GO



CREATE OR ALTER PROCEDURE GetKitchenStaff
    @restaurantId INT
AS
BEGIN
   
    SELECT 
        u.*, 
        (SELECT COUNT(*) 
         FROM OnPrepareOrders op
         JOIN Orders o ON op.orderId = o.orderId
         WHERE op.kitchenStaffId = u.userName 
           AND o.status = 'ready'
        ) AS numberOfPreparedOrders
    FROM Users u 
    JOIN KitchenStaff ks ON u.userName = ks.userName 
    WHERE ks.restaurantId = @restaurantId;
END;
GO



CREATE OR ALTER PROCEDURE GetDelivery
AS
BEGIN
    SELECT 
        u.*,dp.*,
        (SELECT COUNT(*) 
         FROM OnDeliverOrders odo
         JOIN Orders o ON odo.orderId = o.orderId
         WHERE odo.deliveryId = u.userName 
           AND o.status = 'delivered'
        ) AS numberOfDeliveredOrders,

        (SELECT AVG(CAST(r.deliverRating AS FLOAT)) 
         FROM OrderReview r
         JOIN Orders o ON r.orderId = o.orderId
         JOIN OnDeliverOrders odo ON o.orderId = odo.orderId
         WHERE odo.deliveryId = u.userName
        ) AS rate

    FROM Users u
    JOIN DeliveryPerson dp ON u.userName = dp.userName 
    WHERE u.type = 'd';
END;
GO