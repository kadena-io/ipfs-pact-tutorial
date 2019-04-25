;;
;; 
;;---------------------------------------------------------------------------
;;
;; A smart contract model for ipfs.
;; version 01
;;---------------------------------------------------------------------------
;;
;;

;define keyset to guard the modules
(define-keyset 'admin-keyset (read-keyset "admin-keyset"))
(module IPFSInbox 'admin-keyset
 @doc "ipfs smart contract                                                        \
  \ Table                                                                         \
  \  * ipfs-table : This table relates receiver's address with ipfs address       \
  \ API functions                                                                 \
  \  * create-ipfs-address: Inserts a new  entry into ipfs-table.                   \
  \  * send-ipfs-hash : A function that takes in the receiver's address, sender's \
  \  address, the ipfs address and sender-keyset. Places the ipfs address in the  \
  \  receiver's inbox.                                                            \
  \  *check-inbox : A function that checks your inbox and empties it afterwards.  \
  \  Returns an ipfs address  if there is one, or Empty Inbox.                    \                   
  \  * give-ipfs-address: This is an utility function for check-inbox. If address \
  \  in ipfs-table return empty if ipsf address is empty string. Otherwise return \
  \  ipfs address value, sender's address and   erase the value form ipfsInbox    "
  
    
 (defschema ipfs
   ipfs-address:string
   sender-address:string
   keyset:keyset)

 (deftable ipfs-table:{ipfs})

 (defun create-ipfs-address (receiver-address:string
                             ipfs-address:string 
                             sender-address:string
                             sender-keyset:keyset)
  @doc "Inserts a new  entry into ipfs-table."
  
   (enforce-keyset 'admin-keyset)
   (enforce (!= "" receiver-address) "Adress can not be empty.")
   (insert ipfs-table receiver-address {"ipfs-address"      : ipfs-address, 
                                        "sender-address"    : sender-address,
                                        "keyset"            : sender-keyset})
 )
  
 (defun send-ipfs-hash:string (receiver-address:string
                               ipfs-address:string
                               sender-address:string
                               sender-keyset:keyset)
  @doc "A function that takes in the receiver's address, sender's address and the \
   \ ipfs address. if sender-address does not exist in ipfs-table, it creates.    \
   \ Places the ipfs address  in the receiver's inbox with sender's address       "
   
   (if (= false (contains sender-address (keys ipfs-table)))
       (create-ipfs-address sender-address "" "" (read-keyset "admin-keyset"))
       "")
     
   (if (= true (contains receiver-address (keys ipfs-table)))
       (with-read ipfs-table sender-address {"keyset":= keyset }
        (enforce-keyset keyset)    
        (update ipfs-table receiver-address {"ipfs-address": ipfs-address, 
                                             "sender-address": sender-address}))
       (create-ipfs-address receiver-address
                            ipfs-address
                            sender-address
                            (read-keyset "admin-keyset")))

   (format "Ipfs-sent: ipfs-address={}, receiever's address={}, sender's address={}" 
           [ipfs-address receiver-address sender-address])
 )
        
 (defun check-inbox:string (address:string)   
  @doc " A function that checks your inbox and empties it afterwards.      \
   \ Returns an ipfs address if there is one, or Empty Inbox               "
  
  (with-read ipfs-table address {"keyset":= keyset }
   (enforce-keyset keyset))
   (if (= false (contains address (keys ipfs-table)))
       (format "Address not found. {}" [""])
       (give-ipfs-address address))   
 )

;;
;; Utility functions
;;

 (defun give-ipfs-address:string (address:string)    
  @doc "If address in ipfs-table, return empty if ipsf-hash value            \ 
   \ is empty string. Otherwise return ipfs-hash value, sender's address and \
   \ erase the value form ipfs-table                                         "
   (with-read ipfs-table address {"ipfs-address" := ipfs-address, 
                                  "sender-address":= sender-address, 
                                  "keyset" := keyset}
    (enforce-keyset keyset)   
    (update ipfs-table address {"ipfs-address" :"", "sender-address":""})
    (if (= "" ipfs-address)
        (format "Empty Inbox {}" [""] )
        (format "Ipfs address: {}, sender's address: {}"
                [ipfs-address sender-address])))
 )

)

(create-table ipfs-table)