/-  *btc, bws=btc-wallet-store, bp=btc-provider
|%
::  req-id: hash of [xpub chyg idx]
::  pend: lookup of req-id -> requests from wallet-store
::  pend-txbu: lookup req-id -> txbu (to fetch and assoc raw-tx info with txid)
::
::  payment: a payment expected from another ship
::    - address: address generated for this payment
::  piym: incoming payments. Stores all ship moons inside
::  poym: outgoing payments
::  piym-watch/poym-watch:
::   let us link an address back to its incoming/outgoing payment
::
+$  btc-state  [blockcount=@ud fee=sats t=@da]
+$  pend-addr  (map req-id:bp request:bws) 
+$  pend-txbu  (map req-id:bp ship)
::
+$  payment  [=address payer=ship value=sats]
::
+$  piym  (jar ship payment)
+$  poym  (map ship txbu:bws)
+$  piym-watch  (map address ship)
+$  poym-watch  (map address ship)
::
+$  action
  $%  [%set-provider provider=ship]
      [%set-default-wallet ~]
      [%req-pay-address payee=ship value=sats]
      [%pay-address =address payer=ship value=sats]
      [%force-retry ~]
  ==
--
