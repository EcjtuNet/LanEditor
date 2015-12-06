#include<algorithm>
#include<iostream>
#include<cstdio>
#include<cstring>
#include<string>
#include<vector>
using namespace std;
string p;
vector<string> V1;
vector<string> V2;
int next[10000];
void get_next()
{
    int m = p.size();
    int len = m;
    int i , j;
    i = 0;
    j = -1;
    next[0] = -1;
    while (i < len - 1)
    {
        if (j == -1 || p[i] == p[j])
        {
            i++;
            j++;
            next[i] = j;
        }
        else
        {
            j = next[j];
        }
    }
}
int kmp(string s)
{
    int n , m;
    int i , j;
    i = j = 0;
    n = s.size(); m = p.size();
    while (i < n && j < m)
    {
        if (j == -1 || s[i] == p[j])
        {
            i++;
            j++;
        }
        else
        {
            j = next[j];
        }
    }
    if (j == m)
    {
        return i - j + 1;
    }
    return -1;
}
int main()
{
    int n;
    string s;
    cin >> n;
    V1.clear();
    V2.clear();
    for(int i=0; i<n; ++i)
    {
        cin >> s;
        V1.push_back(s);
    }
    cin >> p;
    get_next();
    for(int i=0; i<n; ++i)
    {
        int ans = kmp(V1[i]);
        if(ans >= 0) V2.push_back(V1[i]);
    }
    sort(V2.begin() , V2.end());
    for(int i=0; i<V2.size(); ++i)
        cout << V2[i] << endl;
    return 0;
}