;;
;;
;;---------------------------------------------------------------------------
;;
;; A smart contract model for ipfs.
;; version 02
;;---------------------------------------------------------------------------
;;
;;

;define keyset to guard the modules
(define-keyset 'admin-keyset (read-keyset "admin-keyset"))

(module ipfs-inbox 'admin-keyset
  @doc "ipfs smart contract"

 (defschema ipfs
  @doc "Holds an address with ipfs address"
  ipfs-address:string
  keyset:keyset)

 (deftable ipfs-table:{ipfs})

 (defun send-ipfs-address:object (
  address:string ipfs-address:string keyset:keyset)
  @doc "Inserts or update a new hash into ipfs-table. \
  \ Returns ipfs address and address"
  (enforce (!= "" address) "Address cannot be empty.")
  (enforce (!= "" ipfs-address) "ipfs-address cannot be empty.")
  ;; If there is a address in ipfs-table,
  ;; use the keyset from the table. Else, use keyset from input.
  (with-default-read ipfs-table address
                     ; default value if nothing found
                     {"keyset": keyset}
                     ; binds value from the row if found, or the default value to ks.
                     {"keyset" := ks}
   ;; The stored keyset should match the input keyset.
   (enforce (= keyset ks) "keysets do not match")
   (enforce-keyset ks)
   ;; Insert or update a row
   (write ipfs-table address
          { "ipfs-address": ipfs-address
          , "keyset": ks
          }))
  {"ipfs-address":ipfs-address, "address":address})

  (defun check-inbox:object (address:string)
   @doc " Returns ipfs address  and address if there is one and  empties \
   \ ipfs hash afterwards, and returns Inbox is Empty if there is no"
   (with-read ipfs-table address
              { "ipfs-address":= ipfs-address
              , "keyset":= keyset
              }
    (enforce-keyset keyset)
    (enforce (!= "" ipfs-address) "Inbox is Empty")
    (update ipfs-table address
            { "ipfs-address": ""
            })
    { "ipfs-address":ipfs-address, "address":address }))
)

(create-table ipfs-table)
