$image = docker.exe build -q -t dockerforpact .
$path_of_pact_file = (Get-Item -Path ".\").Parent.FullName + "\" + "pact\code\IPFSInbox.pact"
$path_of_init_yaml_file = (Get-Item -Path ".\").Parent.FullName + "\" + "pact\yamls\initialization.yaml"
$path_of_source_log_folder = (Get-Item -Path ".\").Parent.FullName + "\" + "pact\log\"
$path_of_dest_log_folder = "/pactfiles/log"
$cont_sources = $path_of_source_log_folder + ":" + $path_of_dest_log_folder 
docker.exe run -p  8081:8081 -d --name=ipfscontainer -v $cont_sources $image
$contname = docker.exe ps -aqf "name=ipfscontainer"
$dest_path_for_pact_file = $contname + ":" + "/pactfiles/code/IPFSInbox.pact"
$dest_path_for_init_yaml_file = $contname + ":" + "/pactfiles/yamls/initialization.yaml"
docker.exe cp $path_of_pact_file  $dest_path_for_pact_file
docker.exe cp $path_of_init_yaml_file $dest_path_for_init_yaml_file
docker.exe exec -i -t $contname bash -c ' pact -a yamls/initialization.yaml | curl -d  @- http://localhost:8081/api/v1/send'