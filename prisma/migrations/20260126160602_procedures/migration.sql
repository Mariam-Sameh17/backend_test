DROP PROCEDURE IF EXISTS GetSubscriptionRevenue;
CREATE PROCEDURE GetSubscriptionRevenue(IN p_restaurantId INT)
BEGIN
    SELECT SUM(s.price) AS subRevenue
    FROM customerSubscription cs
    JOIN Subscription s ON cs.subscriptionId = s.planName
    WHERE cs.restaurantId = p_restaurantId;
END;


DROP PROCEDURE IF EXISTS GetRestaurantRating;
CREATE PROCEDURE GetRestaurantRating(IN p_restaurantId INT)
BEGIN
    SELECT AVG(r.restaurantRating) AS rate
    FROM orderReview r
    JOIN Orders o ON r.orderId = o.orderId
    WHERE o.restaurantId = p_restaurantId;
END;

DROP PROCEDURE IF EXISTS GetRestaurantOrders;
CREATE PROCEDURE GetRestaurantOrders(IN p_restaurantId INT)
BEGIN
    SELECT 
        o.*,
        u.name AS customerName,
        u.phoneNumber AS customerPhone,
        (SELECT SUM(quantity)
         FROM orderItems oi 
         WHERE oi.orderId = o.orderId) AS items
    FROM Orders o
    JOIN Users u ON o.customerId = u.userName
    WHERE o.restaurantId = p_restaurantId;
END;


DROP PROCEDURE IF EXISTS GetKitchenStaff;
CREATE PROCEDURE GetKitchenStaff(IN p_restaurantId INT)
BEGIN
    SELECT 
        u.*, 
        (SELECT COUNT(*) 
         FROM onPrepareOrders op
         JOIN Orders o ON op.orderId = o.orderId
         WHERE op.kitchenStaffId = u.userName 
           AND o.status = 'ready'
        ) AS numberOfPreparedOrders
    FROM Users u 
    JOIN kitchenStaff ks ON u.userName = ks.userName 
    WHERE ks.restaurantId = p_restaurantId;
END;


DROP PROCEDURE IF EXISTS GetDelivery;
CREATE PROCEDURE GetDelivery()
BEGIN
    SELECT 
        u.*,
        dp.*,
        (SELECT COUNT(*) 
         FROM onDeliverOrders odo
         JOIN Orders o ON odo.orderId = o.orderId
         WHERE odo.deliveryId = u.userName 
           AND o.status = 'delivered'
        ) AS numberOfDeliveredOrders,

        (SELECT COALESCE(AVG(r.deliverRating), 0)
         FROM orderReview r
         JOIN Orders o ON r.orderId = o.orderId
         JOIN onDeliverOrders odo ON o.orderId = odo.orderId
         WHERE odo.deliveryId = u.userName
        ) AS rate

    FROM Users u
    JOIN deliveryPerson dp ON u.userName = dp.userName 
    WHERE u.type = 'd';
END;