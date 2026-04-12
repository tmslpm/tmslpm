m4_changequote(`[', `]')m4_dnl
m4_dnl open/close m4 block
m4_define([m4_open_block],  [m4_pushdef([_div], m4_divnum)m4_divert(-1)])m4_dnl
m4_define([m4_close_block], [m4_divert(_div)m4_popdef([_div])m4_dnl])m4_dnl
m4_open_block()

m4_dnl log 

m4_define([m4_log], 
    [m4_syscmd([echo "($(tput setaf 5)M4$(tput sgr0)) $1 : $2$(tput sgr0)" >&2])]
)

m4_define([m4_log_debug], 
    [m4_log([$(tput setaf 4)D], [$1])]
)

m4_define([m4_log_info], 
    [m4_log([I], [$1])]
)

m4_define([m4_log_warn], 
    [m4_log([$(tput setaf 3)W], [$1])]
)

m4_define([m4_log_error], 
    [m4_log([$(tput setaf 1)E], [$1])]
)

m4_define([m8_partial],
    [m4_include([partials/$1])m4_dnl]
)

m4_define(
    [m4_call_m4_entry],
    [m4_esyscmd([mkdir -p $(dirname $2) && m4 -P -I . core/base.m4 $1 > $2])m4_dnl]
)

m4_close_block()
