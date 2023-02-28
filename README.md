<h1> Vivre-cards API</h1>

<p>This API serves the Vivre-cards virtual card and makes transactions, expense and spend management, plus rewards a lot seamless for users.</p>

<h3>The Users can</h3> 
<ul>
<li>1. signup</li>
<li>2. login</li>
<li>3. recover lost password</li>
<li>4. change password</li>
<li>5. Deposit</li>
<li>6. Initial Withdrawals</li>
<li>7. See total spent</li>
<li>8. See all card transactions</li>
<li>9. create card</li>
<li>10. View card details</li>
<li>11. Set limit and update limit</li>
<li>12. Can send data to complete compliance</li>
</ul>

<h3>The Admins can</h3>
<ul>
<li>1. view all users</li>
<li>2. view one user</li>
<li>3. update user profile. By update user -- change the user status</li>
<li>4. Enable user. By enableuser -- create Brex user, create providus account and activate brex user</li>

<li>5. See all cards</li>
<li>6. See a single card and respective transactions</li>
<li>7. See all transactions</li>
<li>8. see all deposits</li>
<li>9. See all Withdrawals</li>
<li>10. Set rates</li>
<li>11. See total Users</li>
<li>12 See total active users</li>
<li>13 View last 5 transactions in the dashboard</li>
</ul>

<h2>users</h2>

<h4>login</h4>
send a POST request to 


```
/api/user/login
```

```
{
    "email":"test@test.com",
    "password":"Test@1234"
}
```

<h4>register</h4>
send a POST request to 


```
/api/user/register
```

```
{
    "firstName":"Jerry",
    "lastName": "Mice",
    "email": "jerry@test.com",
    "password": "Test@1234"
}
```

<h4>forgot password</h4>
send a POST request to 


```
/api/user/recover_password
```

```
{
    "email": "test@test.com"
}
```

<h4>reset password</h4>
send a POST request to 


```
/api/user/reset_password
```

```
{
    "reset_token": "1234567890abcdefghijklmnopqrstuvwxyz",
    "new_password": "Test123",
    "confirm_password": "Test123"
}
```

<h4>change password</h4>
send a POST request to 


```
/api/user/change_password
```

```
{
    "email": "test@test.com",
    "new_password": "Test123",
    "confirm_password": "Test123"
}
```

<h4>fund virtual card(Providus)</h4>
send a POST request to 

```
/api/user/deposit
```

```
{
    "type":"USD",
    "amount":5000.56
}
```

<h4>Get rates</h4>
send a GET request to 

```
/api/user/init-deposit-rate/:type
```

```
{
    "amount":5000.56
}
```

<h4>Complete profile</h4>
send a POST request to 

```
/api/user/complete-profile
```

```
[{"key":"last_name","value":"George","type":"text","enabled":true},{"key":"first_name","value":"Godstrump","type":"text","enabled":true},{"key":"stakeOwned","value":"40%","type":"text","enabled":true},{"key":"mediaAwareness","value":"Linkedin","type":"text","enabled":true},{"key":"isIncorporated","value":"true","type":"text","enabled":true},{"key":"usRegisted","value":"false","type":"text","enabled":true},{"key":"utilityAmount","value":"500","type":"text","enabled":true},
{"key":"country","value":"Nigeria","type":"text","enabled":true},{"key":"phone_number","value":"08080854968","type":"text","enabled":true},{"key":"company_sector","value":"IT","type":"text","enabled":true},{"key":"company_name","value":"Omo0","type":"text","enabled":true},{"key":"ein","value":"948488484","type":"text","enabled":true},{"key":"businessAddress","value":"84ndhddud","type":"text","enabled":true},
]
```

<h4>Create reserved account</h4>
send a PATCH request to 

```
/api/user/create-reserved-account
```

```
{
    "account_name": "thereisnothin",
    "bvn": ""
}
```

<h4>Update compliance</h4>
send a PATCH request to 

```
/api/user/deposit
```

```
[{"key":"last_name","value":"George","type":"text","enabled":true},{"key":"first_name","value":"Godstrump","type":"text","enabled":true},{"key":"stakeOwned","value":"40%","type":"text","enabled":true},{"key":"mediaAwareness","value":"Linkedin","type":"text","enabled":true},{"key":"isIncorporated","value":"true","type":"text","enabled":true},{"key":"usRegisted","value":"false","type":"text","enabled":true},{"key":"utilityAmount","value":"500","type":"text","enabled":true},
{"key":"country","value":"Nigeria","type":"text","enabled":true},{"key":"phone_number","value":"08080854968","type":"text","enabled":true},{"key":"company_sector","value":"IT","type":"text","enabled":true},{"key":"company_name","value":"Omo0","type":"text","enabled":true},{"key":"ein","value":"948488484","type":"text","enabled":true},{"key":"businessAddress","value":"84ndhddud","type":"text","enabled":true},
]
```

<h4>Get compliance data</h4>
send a GET request to 

```
/api/user/get-compliance-data
```

```
```

<h4>Get compliance errors</h4>
send a GET request to 

```
/api/user/get-compliance-errors
```

```
```

<h4>fund virtual card(Lazerpay)</h4>
send a POST request to 

```
/api/user/fund-with-lazerpay
```

```
{
    "amount":5000.56,
    "remarks": "Hello"
}
```

<h4>Get refresh token</h4>
send a GET request to 

```
/api/user/get-refresh-token
```

```
```

<h4>Initiate withdrawal</h4>
send a POST request to 

```
/api/user/initiate-withdrawal
```

```
{
    "amount":5000.56,
    "acct_name": "Alex",
    "acct_num": "222222"
}
```

<h4>Refresh Balance</h4>
send a GET request to 

```
/api/user/refresh-balance
```

<h4>Get all banks</h4>
send a GET request to 

```
/api/user/get-all-banks
```

<h4>Add bank account</h4>
send a POST request to 

```
/api/user/add-bank-account
```

```
{
    "accountName": "hfhfh",
    "accountNumber": "9999",
    "bankName": "uddhdhhd"
}
```

<h4>Get User bank accounts</h4>
send a GET request to 

```
/api/user/get-user-bank-accounts
```

<h4>Delete user bank account</h4>
send a DELETE request to 

```
/api/user/delete-user-bank-account/:id
```

<h4>fund virtual card</h4>
send a POST request to 

```
/api/user/deposit
```

```
{
    "amount":5000.56
}
```

<h4>transactions</h4>
send a GET request to 

```
/api/user/transactions
```

<h4>Email Verification</h4>
send a POST request to 

```
/api/user/vivre-cards/email-verification
```

```
{
    "email":"alex@gmail.com,
    "token": "884uururu"
}
```

<h4>Register brex user</h4>
send a POST request to 

```
/api/user/register-brex-user/:id
```

<h2>cards</h2>

<h4>Create card</h4>
send a POST request to 

```
/api/user/deposit
```

```
{
    "card_name": "Testing Tom",
    "reason": "Engineering",
    "spend_limit": 5
}
```

<h4>Lock card</h4>
send a POST request to 

```
/api/user/lock-card/:cardId
```

<h4>Terminate card</h4>
send a POST request to 

```
/api/user/terminate-card/:cardId
```

<h4>UnLock card</h4>
send a POST request to 

```
/api/user/unlock-card/:cardId
```

<h4>fetch card</h4>
send a GET request to 

```
/api/user/fetch-cards
```

<h4>Get user card Transaction</h4>
send a GET request to 

```
/api/user/get-user-card-transactions
```

<h4>Get card transactions</h4>
send a GET request to 

```
/api/user/get-card-transactions/:id
```

<h4>Get card details</h4>
send a GET request to 

```
/api/user/get-card-details/:id
```

<h4>Get user total spent</h4>
send a GET request to 

```
/api/user/get-user-total-spent
```

<h4>Get all transactions</h4>
send a GET request to 

```
/api/user/get-all-txns
```

<h4>Get expense payment(Not used)</h4>
send a POST request to 

```
/api/user/get-expense-payment
```


<h4>Get providus transactions</h4>
send a POST request to 

```
/api/user/get-providus-transactions
```

```
{
"sessionId":"0000042103011805345648005069266636442357859508",
"accountNumber":"9979232186",
"tranRemarks":"FROM UBA/ CASAFINA CREDIT-EASY LOAN-NIP/SEYI OLUFEMI/CASAFINA CAP/0000042103015656180548005069266636",
"transactionAmount":"101000",
"settledAmount":"1",
"feeAmount":"0",
"vatAmount":"0",
"currency":"NGN",
"initiationTranRef":"kjhghjk",
"settlementId":"202210501006907671181432",
"sourceAccountNumber":"2093566866",
"sourceAccountName":"CASAFINA CREDIT-EASY LOAN",
"sourceBankName":"UNITED BANK FOR AFRICA",
"channelId":"1",
"tranDateTime":"2021-03-01 18:06:20"
}
```

<h4>Get parsio email</h4>
send a POST request to 

```
/api/user/get-parsios-email
```

```
{
    "message":"Hello",
    "to": "alex@gmail.com"
}
```

<h4>Get lazerpay transactions</h4>
send a POST request to 

```
/api/user/get-lazerpay-transactions
```

```
{ 
    "reference": "48jjdjd", 
    "senderAddress": "ufufuf", 
    "amountPaidFiat": 484, 
    "hash": "99jdjdjdjd", 
    "network": "ffj",
    "merchantAddress": "rjjrjrj",
    "id": iuuuu48484
}
```

<h4>Get cac infos</h4>
send a POST request to 

```
/api/user/get-cac-infos
```

```
```

<h4>Get affiliates</h4>
send a POST request to 

```
/api/user/affiliates
```

```
{
    "registrationNumber":"4388484"
}
```


<h2>Admin</h2>

<h4>create_admin</h4>
send a POST request to 

```
/api/admin/create_admin
```

```
{
    "Admin_Name": "James Cameron",  
    "Admin_Pin": "1234",
    "Admin_Email": "admin@admin.com"
}
```

<h4>login_admin</h4>
send a POST request to 

```
/api/admin/admin_login
```

```
{
    "Admin_Email": "admin@admin.com",  
    "Admin_Password": "1234"
}
```

<h4>create_user</h4>
send a POST request to 

```
/api/admin/create_user
```

```
{
    "account_name": "Tom Mice",  
    "account_email": "tom@test.com"
}
```

<h4>reverse_transfer</h4>
send a POST request to 

```
/api/admin/reverse_transfer
```

```
{
    "account_number":"3083516000",
    "amount":"600",
    "receiver_account_number": 3089451149,
    "admin_pin":"1234"
}
```

<h4>disable_user</h4>
send a PATCH request to 

```
/api/admin/disable_user
```

```
{
  "account_number": "3089451149",
  "admin_pin":"1234"
}
```

<h4>enable user</h4>
send a PATCH request to 

```
/api/admin/enable_user
```

```
{
  "account_number": "3089451149",
  "admin_pin":"1234"
}
```

<h4>create_reward</h4>
send a POST request to 

```
/api/admin/create_reward
```

```
{
    "reward_name": "Signup Bonus",  
    "reward_type": "Bonus"
}
```

<h4>view_all_admins</h4>
send a  GET request to 

```
/api/admin/view_all_admins
```

<h4>view_all_users</h4>
send a  GET request to 

```
/api/admin/view_all_users
```

<h4>delete_user</h4>
send a DELETE request to 

```
/api/admin/delete_user
```
```
{
    "account_number":"3089451149",
    "admin_pin":"1234"
}
```

<h4>user_reward</h4>
send a POST request to 

```
/api/user/reward
```

```
{
    "account_number":"3083516000",
    "amount":"100",
    "reward_type": "Signup Bonus"
}
```

<h4>user_dispute</h4>
send a POST request to 

```
/api/user/dispute
```

```
{
    "account_number":"3083516000",
    "dispute_type": "Fund Error"
}
```

<h4>users_rewards</h4>
send a GET request to 

```
/api/user/rewards
```

<h4>users_disputes</h4>
send a GET request to 

```
/api/user/disputes
```

<h4>Get cards</h4>
send a GET request to 

```
/api/user/get-cards
```

<h4>Get card details</h4>
send a POST request to 

```
/api/user/get-card-details/:id
```

<h4>Get user company</h4>
send a POST request to 

```
/api/user/get-user-company/:id
```

<h4>Get compliance errors</h4>
send a GET request to 

```
/api/user/get-compliance-errors
```

<h4>Set compliance errors</h4>
send a PATCH request to 

```
/api/user/set-compliance-errors/:id
```

```
{
    "first_name":"Alex"
}
```
<h4>Approve compliance</h4>
send a POST request to 

```
/api/user/approve-compliance/:id
```

```
{
    "vgEmail":"alex@gmail.com
}
```

<h4>Create card user</h4>
send a POST request to 

```
/api/user/create-card-user/:id
```

```
{
    "vgEmail":"alex@gmail.com
}
```

<h4>Create providus account</h4>
send a POST request to 

```
/api/user/create-providus-acct/:id
```

<h4>Update brex user</h4>
send a POST request to 

```
/api/user/update-brex-user/:id
```

```
{
    "status":"DISABLE"
}
```

<h4>Set rate type</h4>
send a POST request to 

```
/api/user/set-rate/:type
```

```
{
    "rate":750,
    "charge": 2,
    "fee": 1
}
```

<h4>Get USD rate</h4>
send a GET request to 

```
/api/user/get-usd-rate
```

<h4>Get compliane data</h4>
send a GET request to 

```
/api/user/get-compliance-data
```

```
{
    "registrationNumber":500
}
```

<h4>Get all withdrawals</h4>
send a GET request to 

```
/api/user/get-all-withdrawals
```

<h4>Get all deposit</h4>
send a POST request to 

```
/api/user/get-all-deposits
```

<h4>Approve withdrawals</h4>
send a POST request to 

```
/api/user/approve-withdrawal/:id
```

<h4>Get card transactions</h4>
send a GET request to 

```
/api/user/get-card-txns/:id
```

<h4>Get all card transactions</h4>
send a GET request to 

```
/api/user/create-card-user/:id
```

<h4>Get total card spent</h4>
send a GET request to 

```
/api/user/create-card-user/:id
```

<h4>Get total deposits</h4>
send a GET request to 

```
/api/user/get-total-deposits
```

<h4>get total users</h4>
send a POST request to 

```
/api/user/get-total-users
```

<h2>Utils</h2>

<h4>AWS Send mail</h4>

```
Helper function used to send mail to aws
```

<h4>calc total</h4>

```
Helper function to cal the total amount in usd
```

<h4>contants</h4>

```
Helper file that contains contants
```

<h4>credit card design</h4>

```
Helper function used as a card design template
```

<h4>email template</h4>

```
Email template is a helper function that servers a template for emails
```

<h4>Fetch</h4>

```
Helper function that serves a HTTP client
```

<h4>Generate file name</h4>

```
Helper functions that is used to create file name for aws
```

<h4>Reverse Total</h4>

```
helper functiont to reverse the amount in naira back to dollar as well as the charges
```
