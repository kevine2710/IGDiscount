app.controller('listProduct', function($scope, $filter, $http, $window, usSpinnerService, Notification) {

    angular.element(document).ready(function() {
        $scope.all = false
        $scope.load()
    })

    $scope.load = function() {
        var rqtKindOfUser = {
            method : 'GET',
            url : '/kindOfUser',
            headers : { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' }
        };

        usSpinnerService.spin('spinner-1');
        $scope.startcounter++;

        $http(rqtKindOfUser).success(function(data){
            $scope.orderRows = []
            $scope.order = {}
            if (data.kindOfUser == "Seller Company") {
                var rqtProduct = {
                    method : 'GET',
                    url : '/sellerCompany/'+ data.id +'/order/cancelledOrPaid',
                    headers : { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' }
                }

                $scope.idSimpleUser = data.id

                $http(rqtProduct).success(function(data){
                    console.log(data)
                    var xhr = new XMLHttpRequest();
                    for (var i = 0; i < data.length; i++) {
                        var arrayBuffer = data[i].product.image.content;
                        var bytes = new Uint8Array(arrayBuffer);
                        var blob = new Blob( [ bytes ], { type: data[i].product.image.mime } );
                        var urlCreator = window.URL || window.webkitURL;
                        var imageUrl = urlCreator.createObjectURL( blob );

                        var a = new Date(data[i].stateDate);
                        var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
                        var year = a.getFullYear();
                        var month = months[a.getMonth()];
                        var date = a.getDate();
                        var hour = a.getHours();
                        var min = a.getMinutes();

                        $scope.orderRows.push({
                            id : data[i].id,
                            customerId : data[i].simpleUser.id,
                            customer : data[i].simpleUser.firstName + " " + data[i].simpleUser.lastName,
                            image: imageUrl,
                            date: date + " " + month + " " + year + ", " + hour + ":" +min,
                            name : data[i].product.name,
                            price : (Math.round(data[i].product.price*100)/100),
                            quantity : data[i].quantity,
                            quantityMax : data[i].product.quantity,
                            state : data[i].state
                        });
                    }
                    $scope.groupProperty = "customer"
                    $scope.filterProperty = 'Paid'
                    usSpinnerService.stop('spinner-1');

                })

            }
         })
     }

    $scope.quantityConflict = function(productName) {
        Notification.warning('Insufficient stock of ' + productName);
    }

    $scope.confirm = function(row) {

        var rqt = {
            method : 'PUT',
            url : '/simpleUser/' + row.customerId + '/order/' + row.id + '/state/confirm',
            headers : { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' }
        };

        if (row.quantity > row.quantityMax) {
            $scope.quantityConflict(row.name)
        }

        $http(rqt).success(function(data){
            Notification.success('Order confirmed');
            if(!$scope.all) {
               $scope.load()
            }
        })
    }

    $scope.confirmAll = function(rows) {
        $scope.all = true
        for (var i = 0; i < rows.length; i++) {
            if (rows[i].state == 'Pending') {
                $scope.confirm(rows[i])
            }
        }
        $scope.load()
    }

    $scope.cancel = function(row) {

        var rqt = {
            method : 'PUT',
            url : '/simpleUser/' + row.customerId + '/order/' + row.id + '/state/cancel',
            headers : { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' }
        };

        $http(rqt).success(function(data){
            Notification.success('Order cancelled');
            $scope.load()
        })
    }

     $scope.displayedCollection = [].concat($scope.orderRows);


})