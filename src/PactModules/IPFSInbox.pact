;;
;; 
;;-----------------------
;;
;; A smart contract model for ipfs.
;; version 2
;;---------------------------------------------------------------------------
;define keyset to guard the modules
(define-keyset 'admin-keyset (read-keyset "admin-keyset"))
(module IPFSInbox 'admin-keyset
 @doc "ipfs smart contract                                                                  \
  \ Table                                                                                   \
  \  * ipfsInbox : This table relates address with ipfsHash                                 \
  \ API functions                                                                           \
  \  * create-ipfsInbox: Inserts a new  entry into ipfsInboxtable.                          \
  \  * sendIPFS : A function that takes in the receiver's address, sender's address and the \
  \  IPFS address. Places the IPFS address in the receiver's inbox.                         \
  \  A function that checks your inbox and empties it afterwards.                           \
  \  * giveIPFSHash: This is an utility function for checkInbox. If address in ipfsInbox    \
  \  table, return empty if ipsfHash is empty string. Otherwise return ipfsHash value and   \
  \  erase the value form ipfsInbox                                                         \
  \  * checkInbox: Returns an address if there is one, or Empty Inbox.                      "
    
 (defschema ipfsinbox ipfsHash:string senderAddress:string)
 (deftable ipfsInbox:{ipfsinbox})
 (defun create-ipfsInbox (address:string ipfsHash:string senderAddress:string)
  @doc "Inserts a new  entry into ipfsInboxtable."
   (enforce (!= "" address) "Adress can not be empty.")
   (insert ipfsInbox address {"ipfsHash"      : ipfsHash, 
                              "senderAddress" : senderAddress})
 )
   
 (defun sendIPFS:string (address:string ipfsHash:string senderAddress:string)
  @doc "A function that takes in the receiver's address, sender's address and the       \
   \ IPFS address. Places the IPFS address in the receiver's inbox with sender's address"
   (if (= true (contains address (keys ipfsInbox)))
       (update ipfsInbox address {"ipfsHash": ipfsHash})
       (insert ipfsInbox address {"ipfsHash": ipfsHash, "senderAddress":senderAddress}))
   (format "ipfsSent: ipfsHash={}, receiever's address={}" [ipfsHash address])
 )
        
 (defun giveIPFSHash:string (address:string senderAddress:string)    
  @doc "If address in ipfsInbox table, return empty if ipsfHash                                             \ 
   \ is empty string. Otherwise return ipfsHash value, sender's address and erase the value form ipfsInbox  "
   (with-read ipfsInbox address {"ipfsHash" := ipfsHash, "senderAddress":=senderAddress}
    (update ipfsInbox address {"ipfsHash" :"", "senderAddress":""})
     (if (= "" ipfsHash) (format "Empty Inbox {}" [""] )
                         (format "IPFS Hash: {}, sender's address: {}" [ipfsHash senderAddress]))
   )
 )
 (defun checkInbox:string (address:string)   
  @doc " A function that checks your inbox and empties it afterwards. \
   \ Returns an address if there is one, or Empty Inbox               "
   (if (= false (contains address (keys ipfsInbox)))
       (format "Empty Inbox {}" [""] )
       (giveIPFSHash address))
 )
)
;;  
(create-table ipfsInbox)