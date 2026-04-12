m4_open_block()
m4_log_info([core/compiler.m4 loaded])
 
m4_dnl clean ../dist

m4_syscmd(
    [rm -rf ../dist && mkdir -p ../dist]
)

m4_call_m4_entry([styles/style.css], [../dist/style.css])
  
m4_dnl loop ../views/$name

m4_define(
    [m4_start_loop], 
    [m4_loop(m4_esyscmd([ls views/ | tr '\n' ',']))m4_dnl]
)

m4_define(
    [m4_loop], 
    [m4_ifelse(
        [$1], 
        [], 
        [], 
        [m4_call_m4_entry([views/$1], [../dist/$1])m4_dnl
m4_loop(m4_shift($@))])])

m4_close_block()
m4_start_loop()m4_dnl
